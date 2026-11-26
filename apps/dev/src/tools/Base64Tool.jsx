import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';

const toBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

const fromBase64 = (value) => {
  const compact = value.replace(/\s+/g, '');
  if (!compact) return { ok: true, text: '' };
  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(compact) || compact.length % 4 === 1) {
    return { ok: false, error: 'That is not valid Base64. Only A–Z, a–z, 0–9, +, / and = are allowed.' };
  }
  try {
    const normalised = compact.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised + '='.repeat((4 - (normalised.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, error: 'The Base64 decodes to bytes that are not valid UTF-8 text. This tool only handles text, not binary files.' };
  }
};

export const Base64Tool = () => {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return { ok: true, text: '' };
    return mode === 'encode' ? { ok: true, text: toBase64(input) } : fromBase64(input);
  }, [input, mode]);

  const copy = async () => {
    if (!result.ok || !result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch {
      /* clipboard blocked; the output is still selectable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const swap = () => {
    if (!result.ok) return;
    setInput(result.text);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const inBytes = new TextEncoder().encode(input).length;
  const outBytes = result.ok ? new TextEncoder().encode(result.text).length : 0;

  return (
    <section className="workspace">
      <div className="toolbar">
        <span className="toolbar-group" role="group" aria-label="Direction">
          <button type="button" className={`seg ${mode === 'encode' ? 'on' : ''}`} onClick={() => setMode('encode')}>
            Encode
          </button>
          <button type="button" className={`seg ${mode === 'decode' ? 'on' : ''}`} onClick={() => setMode('decode')}>
            Decode
          </button>
        </span>
        <button type="button" className="btn" onClick={swap} disabled={!result.ok || !result.text}>
          <Icons.Swap /> Swap
        </button>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={copy} disabled={!result.ok || !result.text}>
          <Icons.Copy /> {copied ? 'Copied' : 'Copy result'}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setInput('');
            setCopied(false);
          }}
          disabled={!input}
        >
          <Icons.Trash /> Clear
        </button>
      </div>

      <div className="work">
        <div className="field-card">
          <div className="field-head">
            {mode === 'encode' ? 'Plain text' : 'Base64'}
            <span className="right mono">{inBytes} bytes</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                copy();
              }
            }}
            spellCheck={false}
            placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste a Base64 string to decode…'}
            aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
          />
          <div className="field-foot">
            <span>{input.length} characters</span>
            <span className="spacer" />
            <span>UTF-8</span>
          </div>
        </div>

        <div className="field-card">
          <div className="field-head">
            {mode === 'encode' ? 'Base64' : 'Plain text'}
            <span className="right mono">{result.ok ? `${outBytes} bytes` : 'invalid'}</span>
          </div>
          <textarea
            value={result.ok ? result.text : ''}
            readOnly
            spellCheck={false}
            placeholder="Result appears here…"
            aria-label="Result"
          />
          <div className="field-foot">
            <span>{result.ok && result.text ? `${result.text.length} characters` : 'Waiting for input'}</span>
            <span className="spacer" />
            {result.ok && result.text && <span>select the result to copy manually</span>}
          </div>
        </div>
      </div>

      {!result.ok && <div className="inline-err">{result.error}</div>}

      <div className="note">
        <Icons.Shield />
        <span>
          Encoding and decoding happen in this tab. Nothing is uploaded, and the tool never stores your text.
          Base64 is an encoding, not encryption — anyone can decode it.
        </span>
      </div>
    </section>
  );
};

export default Base64Tool;
