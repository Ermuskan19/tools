import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import { highlightTokens } from '../lib/json';

const b64urlDecode = (part) => {
  const normalised = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalised + '='.repeat((4 - (normalised.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

const readJsonPart = (part, label) => {
  let text;
  try {
    text = b64urlDecode(part);
  } catch {
    return { ok: false, error: `The ${label} is not valid Base64url.` };
  }
  try {
    return { ok: true, text, value: JSON.parse(text) };
  } catch {
    return { ok: false, error: `The ${label} decodes, but the result is not JSON.` };
  }
};

const relative = (seconds, now) => {
  const diff = seconds - now;
  const abs = Math.abs(diff);
  const units = [
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute']
  ];
  for (const [size, name] of units) {
    if (abs >= size) {
      const n = Math.round(abs / size);
      return `${n} ${name}${n === 1 ? '' : 's'} ${diff < 0 ? 'ago' : 'from now'}`;
    }
  }
  return `${Math.round(abs)} seconds ${diff < 0 ? 'ago' : 'from now'}`;
};

const JsonBlock = ({ text }) => {
  const lines = text.split('\n');
  return (
    <pre>
      {lines.map((line, i) => (
        <div key={i}>
          {highlightTokens(line).map((t, j) => (
            <span key={j} className={t.type}>{t.value}</span>
          ))}
        </div>
      ))}
    </pre>
  );
};

export const JwtDecoder = () => {
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState('');

  const decoded = useMemo(() => {
    const clean = token.trim().replace(/^Bearer\s+/i, '');
    if (!clean) return { state: 'empty' };
    const parts = clean.split('.');
    if (parts.length !== 3) {
      return {
        state: 'error',
        error: `A JWT has three parts separated by dots (header.payload.signature). This one has ${parts.length}.`
      };
    }
    const header = readJsonPart(parts[0], 'header');
    if (!header.ok) return { state: 'error', error: header.error };
    const payload = readJsonPart(parts[1], 'payload');
    if (!payload.ok) return { state: 'error', error: payload.error };
    return { state: 'ok', header, payload, signature: parts[2] };
  }, [token]);

  const claims = useMemo(() => {
    if (decoded.state !== 'ok') return null;
    const now = Math.floor(Date.now() / 1000);
    const p = decoded.payload.value || {};
    const rows = [];
    if (typeof p.exp === 'number') {
      rows.push({
        label: 'exp',
        at: new Date(p.exp * 1000),
        note: p.exp < now ? `expired ${relative(p.exp, now)}` : `expires ${relative(p.exp, now)}`,
        bad: p.exp < now
      });
    }
    if (typeof p.nbf === 'number') {
      rows.push({
        label: 'nbf',
        at: new Date(p.nbf * 1000),
        note: p.nbf > now ? `not valid yet — starts ${relative(p.nbf, now)}` : 'valid from this time',
        bad: p.nbf > now
      });
    }
    if (typeof p.iat === 'number') {
      rows.push({ label: 'iat', at: new Date(p.iat * 1000), note: `issued ${relative(p.iat, now)}`, bad: false });
    }
    return rows;
  }, [decoded]);

  const status = useMemo(() => {
    if (!claims) return null;
    if (claims.some((c) => c.label === 'exp' && c.bad)) return { tone: 'bad', text: 'This token has expired' };
    if (claims.some((c) => c.bad)) return { tone: 'bad', text: 'This token is not active yet' };
    if (claims.some((c) => c.label === 'exp')) return { tone: 'ok', text: 'This token has not expired' };
    return { tone: '', text: 'No exp claim — this token does not expire' };
  }, [claims]);

  const copy = async (text, which) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(which);
    setTimeout(() => setCopied(''), 1600);
  };

  const pretty = (part) => (part && part.ok ? JSON.stringify(part.value, null, 2) : '');

  return (
    <section className="workspace">
      <div className="toolbar">
        <span className="mono" style={{ fontSize: 12, color: 'var(--mut)' }}>Bearer token</span>
        <span className="spacer" />
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setToken('');
            setCopied('');
          }}
          disabled={!token}
        >
          <Icons.Trash /> Clear
        </button>
      </div>

      <div className="field-card">
        <div className="field-head">
          Encoded token
          <span className="right mono">{token.trim() ? `${token.trim().length} characters` : 'empty'}</span>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          spellCheck={false}
          placeholder="Paste a JWT — header.payload.signature"
          aria-label="JWT"
          style={{ minHeight: 110, resize: 'vertical' }}
        />
      </div>

      {decoded.state === 'error' && <div className="inline-err" style={{ marginTop: 12 }}>{decoded.error}</div>}

      {decoded.state === 'ok' && (
        <div style={{ marginTop: 16 }}>
          {status && (
            <div className="jwt-summary">
              <span className={`pill ${status.tone}`}>
                {status.tone === 'ok' ? <Icons.Check /> : status.tone === 'bad' ? <Icons.Alert /> : <Icons.Clock />}
                {status.text}
              </span>
              <span className="pill">{decoded.header.value?.alg || 'no alg'}</span>
              {decoded.header.value?.typ && <span className="pill">{decoded.header.value.typ}</span>}
            </div>
          )}

          <div className="field-card jwt-part">
            <div className="field-head">
              <span className="tag">Header</span>
              <span className="right">
                <button type="button" className="btn sm" onClick={() => copy(pretty(decoded.header), 'header')}>
                  <Icons.Copy /> {copied === 'header' ? 'Copied' : 'Copy'}
                </button>
              </span>
            </div>
            <JsonBlock text={pretty(decoded.header)} />
          </div>

          <div className="field-card jwt-part">
            <div className="field-head">
              <span className="tag">Payload</span>
              <span className="right">
                <button type="button" className="btn sm" onClick={() => copy(pretty(decoded.payload), 'payload')}>
                  <Icons.Copy /> {copied === 'payload' ? 'Copied' : 'Copy'}
                </button>
              </span>
            </div>
            <JsonBlock text={pretty(decoded.payload)} />
          </div>

          {claims && claims.length > 0 && (
            <div className="field-card jwt-part">
              <div className="field-head">Time claims</div>
              <div style={{ padding: '12px 14px', display: 'grid', gap: 8 }}>
                {claims.map((c) => (
                  <div key={c.label} className="mono" style={{ fontSize: 12.5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--cy)', minWidth: 34 }}>{c.label}</span>
                    <span style={{ color: 'var(--ink)' }}>{c.at.toISOString()}</span>
                    <span style={{ color: c.bad ? 'var(--red)' : 'var(--mut)' }}>{c.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="field-card jwt-part sig">
            <div className="field-head">
              <span className="tag">Signature</span>
              <span className="right">
                <button type="button" className="btn sm" onClick={() => copy(decoded.signature, 'sig')}>
                  <Icons.Copy /> {copied === 'sig' ? 'Copied' : 'Copy'}
                </button>
              </span>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 'none' }}>{decoded.signature || '(empty)'}</pre>
          </div>

          <div className="inline-err" style={{ background: 'var(--card)', borderColor: 'rgba(251, 191, 36, 0.35)', borderLeftColor: 'var(--amb)', color: 'var(--mut)' }}>
            <strong style={{ color: 'var(--amb)' }}>Not verified.</strong> This tool decodes the token; it does not check the
            signature, so a decoded token proves nothing about who issued it. Only your server can verify it with the secret
            or public key.
          </div>
        </div>
      )}

      <div className="note">
        <Icons.Shield />
        <span>The token is decoded in this tab and never sent anywhere. Close the tab and it is gone.</span>
      </div>
    </section>
  );
};

export default JwtDecoder;
