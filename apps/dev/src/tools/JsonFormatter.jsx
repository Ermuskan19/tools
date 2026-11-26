import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import {
  SAMPLE_JSON,
  buildOutput,
  byteSize,
  decodeShare,
  encodeShare,
  formatBytes,
  parseJson,
  repairJson,
  highlightTokens,
  statsFor,
  unitFor
} from '../lib/json';

const MAX_BYTES = 1024 * 1024;
const HEAVY_BYTES = 200 * 1024;

const Code = ({ text, tokens, className = '' }) => {
  if (tokens) {
    return tokens.map((t, i) => (
      <span key={i} className={t.type}>{t.value}</span>
    ));
  }
  return <span className={className}>{text}</span>;
};

export const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [committed, setCommitted] = useState('');
  const [indent, setIndent] = useState(2);
  const [sort, setSort] = useState(false);
  const [auto, setAuto] = useState(true);
  const [mode, setMode] = useState('format');
  const [copied, setCopied] = useState('');
  const [fixInfo, setFixInfo] = useState(null);
  const [shareUrl, setShareUrl] = useState('');

  const taRef = useRef(null);
  const preRef = useRef(null);
  const gutRef = useRef(null);
  const outRef = useRef(null);
  const fileRef = useRef(null);

  // Load a shared payload from the URL hash once.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#j=')) return;
    const text = decodeShare(hash.slice(3));
    if (text) {
      setInput(text);
      setCommitted(text);
    }
  }, []);

  // Auto format, 250 ms after typing stops.
  useEffect(() => {
    if (!auto) return undefined;
    const t = setTimeout(() => setCommitted(input), 250);
    return () => clearTimeout(t);
  }, [input, auto]);

  const bytes = byteSize(input);
  const tooBig = bytes > MAX_BYTES;
  const heavy = bytes > HEAVY_BYTES;

  const parsed = useMemo(() => {
    if (!committed.trim()) return { state: 'empty' };
    if (byteSize(committed) > MAX_BYTES) return { state: 'big' };
    const res = parseJson(committed);
    if (!res.ok) return { state: 'invalid', error: res.error };
    const output = buildOutput(res.value, { indent, sort, minify: mode === 'minify' });
    return {
      state: 'ok',
      value: res.value,
      output,
      stats: statsFor(res.value, committed, output)
    };
  }, [committed, indent, sort, mode]);

  const outputLines = useMemo(() => {
    if (parsed.state !== 'ok') return [];
    return parsed.output.split('\n');
  }, [parsed]);

  const inputLines = useMemo(() => input.split('\n'), [input]);
  const badLine = parsed.state === 'invalid' ? parsed.error.line : 0;

  const inputTokens = useMemo(() => {
    if (heavy) return null;
    return inputLines.map((line) => highlightTokens(line));
  }, [inputLines, heavy]);

  const outputTokens = useMemo(() => {
    if (heavy) return null;
    return outputLines.map((line) => highlightTokens(line));
  }, [outputLines, heavy]);

  const syncScroll = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutRef.current) gutRef.current.scrollTop = ta.scrollTop;
  };

  const scrollToError = useCallback((line) => {
    const ta = taRef.current;
    if (!ta || !line) return;
    const top = (line - 1) * 20;
    ta.scrollTop = Math.max(0, top - 80);
    syncScroll();
  }, []);

  useEffect(() => {
    if (parsed.state === 'invalid') scrollToError(parsed.error.line);
  }, [parsed, scrollToError]);

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(''), 1600);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopied(which);
      setTimeout(() => setCopied(''), 1600);
    }
  };

  const loadFile = (file) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setInput('');
      setCommitted('');
      setFixInfo({ ok: false, message: `${file.name} is ${formatBytes(file.size)}. The limit is 1 MB per paste.` });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setInput(text);
      setCommitted(text);
      setFixInfo(null);
    };
    reader.readAsText(file);
  };

  const applyFormat = (nextMode) => {
    setMode(nextMode);
    setCommitted(input);
    setFixInfo(null);
  };

  const onPaste = (e) => {
    const text = e.clipboardData?.getData('text');
    if (!text) return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + text + input.slice(end);
    setInput(next);
    setCommitted(next);
  };

  const fix = () => {
    const result = repairJson(input);
    if (!result.ok) {
      setFixInfo({ ok: false, message: 'Automatic repair did not work on this file. The error panel still shows exactly where it breaks.' });
      return;
    }
    setInput(result.text);
    setCommitted(result.text);
    setFixInfo({
      ok: true,
      changes: result.changes,
      message: result.changes.length
        ? `Fixed ${result.changes.length} issue${result.changes.length === 1 ? '' : 's'}: ${result.changes.join(', ')}. Ctrl+Z in the editor restores the original.`
        : 'The JSON already parsed. Nothing needed changing.'
    });
    requestAnimationFrame(() => taRef.current?.focus());
  };

  const share = async () => {
    if (!input.trim()) return;
    const url = `${window.location.origin}${window.location.pathname}#j=${encodeShare(input)}`;
    setShareUrl(url);
    await copy(url, 'share');
  };

  const download = () => {
    if (parsed.state !== 'ok') return;
    const blob = new Blob([parsed.output], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const unit = unitFor(indent);
      const next = input.slice(0, start) + unit + input.slice(end);
      setInput(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + unit.length;
      });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      applyFormat('format');
    }
  };

  const indentLabel = indent === 'tab' ? 'Tab' : `${indent} spaces`;
  const canAct = parsed.state === 'ok';

  return (
    <section className="workspace">
      <div className="toolbar">
        <button
          type="button"
          className="btn"
          onClick={async () => {
            try {
              const text = await navigator.clipboard.readText();
              if (text) {
                setInput(text);
                setCommitted(text);
                setFixInfo(null);
                return;
              }
            } catch {
              /* clipboard read is blocked — fall back to focusing the editor */
            }
            taRef.current?.focus();
          }}
        >
          <Icons.Paste /> Paste
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          <Icons.Upload /> Upload
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setInput(SAMPLE_JSON);
            setCommitted(SAMPLE_JSON);
            setFixInfo(null);
          }}
        >
          <Icons.File /> Sample
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setInput('');
            setCommitted('');
            setFixInfo(null);
            setShareUrl('');
            taRef.current?.focus();
          }}
        >
          <Icons.Trash /> Clear
        </button>

        <span className="spacer" />

        <span className="toolbar-group" role="group" aria-label="Indentation">
          {[2, 4, 'tab'].map((value) => (
            <button
              key={value}
              type="button"
              className={`seg ${indent === value ? 'on' : ''}`}
              onClick={() => setIndent(value)}
            >
              {value === 'tab' ? 'Tab' : `${value} sp`}
            </button>
          ))}
        </span>

        <label className="toggle">
          <input type="checkbox" checked={sort} onChange={(e) => setSort(e.target.checked)} />
          Sort keys A–Z
        </label>

        <label className="toggle">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Auto format
        </label>

        <button type="button" className="btn primary" onClick={() => applyFormat('format')} disabled={tooBig}>
          Format
        </button>
        <button type="button" className="btn" onClick={() => applyFormat('minify')} disabled={tooBig}>
          Minify
        </button>
      </div>

      <div className="panes">
        <div className={`pane ${parsed.state === 'invalid' ? 'invalid' : ''} ${canAct ? 'valid' : ''}`}>
          <div className="ph">
            <span className="dot" />
            Input
            <span className="right">
              <span>{input ? `${inputLines.length} lines · ${formatBytes(bytes)}` : 'empty'}</span>
            </span>
          </div>
          <div className="ed">
            <div className="gut" ref={gutRef}>
              {inputLines.map((_, i) => (
                <span key={i} className={badLine === i + 1 ? 'bad' : ''}>{i + 1}</span>
              ))}
            </div>
            <div className="code-wrap">
              <pre ref={preRef} aria-hidden="true">
                {inputTokens
                  ? inputLines.map((line, i) => (
                      <div key={i} className={badLine === i + 1 ? 'hl-bad' : ''}>
                        <Code text={line} tokens={inputTokens[i]} />
                      </div>
                    ))
                  : input}
              </pre>
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={syncScroll}
                onPaste={onPaste}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                placeholder={'Paste JSON here…\n\n{\n  "hello": "world"\n}'}
                aria-label="JSON input"
              />
            </div>
          </div>
        </div>

        <div className={`pane ${canAct ? 'valid' : ''}`}>
          <div className="ph">
            <span className="dot" />
            {mode === 'minify' ? 'Minified' : 'Formatted'}
            <span className="right">
              <button
                type="button"
                className="btn"
                onClick={() => copy(parsed.output, 'output')}
                disabled={!canAct}
              >
                <Icons.Copy /> {copied === 'output' ? 'Copied' : 'Copy'}
              </button>
              <button type="button" className="btn" onClick={download} disabled={!canAct}>
                <Icons.Download />
              </button>
            </span>
          </div>
          {canAct ? (
            <div className="out" ref={outRef}>
              {outputLines.map((line, i) => (
                <div className="ol" key={i}>
                  <span className="n">{i + 1}</span>
                  <span className="c">
                    <Code text={line} tokens={outputTokens ? outputTokens[i] : null} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="out-empty">
              <span>
                <span className="mono">{parsed.state === 'invalid' ? '{ ! }' : parsed.state === 'big' ? '> 1 MB' : '{ }'}</span>
                {parsed.state === 'invalid'
                  ? 'Output paused. Fix the JSON below and it formats automatically.'
                  : parsed.state === 'big'
                    ? 'This paste is over the 1 MB limit, so it is not formatted. Trim it and try again.'
                    : 'Formatted JSON appears here as you type.'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="status">
        <span className={`pill ${parsed.state === 'ok' ? 'ok' : parsed.state === 'invalid' ? 'bad' : ''}`}>
          {parsed.state === 'ok' ? <><Icons.Check /> Valid JSON</> : parsed.state === 'invalid' ? <><Icons.Alert /> Invalid JSON</> : 'Waiting'}
        </span>
        {parsed.state === 'ok' && (
          <span>
            {parsed.stats.from} → {parsed.stats.to} · {parsed.stats.keys}{' '}
            {parsed.stats.keys === 1 ? 'key' : 'keys'} · depth {parsed.stats.depth} · {parsed.stats.lines}{' '}
            {parsed.stats.lines === 1 ? 'line' : 'lines'}
          </span>
        )}
        {parsed.state === 'invalid' && (
          <span>line {parsed.error.line}, column {parsed.error.column}</span>
        )}
        <span className="spacer" />
        <span className="hint">
          {tooBig ? 'Over the 1 MB limit' : `${formatBytes(bytes)} / 1 MB`} · {indentLabel} · {heavy ? 'highlighting off' : 'Ctrl+Enter formats'}
        </span>
      </div>

      {parsed.state === 'invalid' && (
        <div className="err-box">
          <div className="err-title">
            <Icons.Alert />
            Can’t parse this JSON
            <span className="where">line {parsed.error.line}, column {parsed.error.column}</span>
          </div>
          <div className="err-msg">{parsed.error.raw}</div>
          <div className="err-hint">{parsed.error.hint}</div>
          <div className="err-code">
            {parsed.error.snippet}
            {'\n'}
            <span className="caret">{parsed.error.caret}</span>
          </div>
          <div className="err-actions">
            <button type="button" className="btn primary sm" onClick={fix}>
              <Icons.Wand /> Fix it
            </button>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() =>
                copy(
                  `${parsed.error.raw}\nLine ${parsed.error.line}, column ${parsed.error.column}\n${parsed.error.lineText}`,
                  'error'
                )
              }
            >
              {copied === 'error' ? 'Copied' : 'Copy error'}
            </button>
            <span className="hint" style={{ fontSize: 12, color: '#f3b4b4' }}>
              Fix it changes the input only — Ctrl+Z restores it.
            </span>
          </div>
        </div>
      )}

      {fixInfo && (
        <div className={`note ${fixInfo.ok ? '' : ''}`}>
          <Icons.Check />
          <span>{fixInfo.message}</span>
        </div>
      )}

      <div className="note">
        <Icons.Link />
        <span>
          <button type="button" className="btn sm" onClick={share} disabled={!input.trim()}>
            <Icons.Link /> {copied === 'share' ? 'Link copied' : 'Copy share link'}
          </button>{' '}
          The JSON is packed into the URL itself, so the link works without a server — but it is only as private as the URL.
          {shareUrl && <span className="mono" style={{ display: 'block', marginTop: 6, wordBreak: 'break-all', color: 'var(--mut)' }}>{shareUrl}</span>}
        </span>
      </div>

      <div className="note">
        <Icons.Shield />
        <span>
          Your JSON never leaves this tab. Formatting, validation and repair run in the browser.
          Limit: 1 MB per paste. Highlighting switches off above 200 KB to keep typing smooth.
        </span>
      </div>

            <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,text/plain"
        className="visually-hidden"
        onChange={(e) => {
          loadFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </section>
  );
};

export default JsonFormatter;
