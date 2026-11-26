import { useEffect, useState } from 'react';
import { qrDataUrl } from '../lib/qr';

export const Field = ({ label, children, hint }) => (
  <div className="cal-field">
    <label className="field-label">{label}</label>
    <div className="number-box wide">{children}</div>
    {hint && <p className="panel-note" style={{ marginTop: 6 }}>{hint}</p>}
  </div>
);

export const TextInput = (props) => (
  <input type="text" {...props} style={{ width: '100%', ...(props.style || {}) }} />
);

export const TextArea = ({ rows = 5, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    style={{
      width: '100%',
      border: 0,
      outline: 'none',
      resize: 'vertical',
      font: 'inherit',
      background: 'transparent',
      ...(props.style || {})
    }}
  />
);

export const QrPreview = ({ value, fg = '#0F766E', size = 512, label }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    setError(false);
    qrDataUrl(value, { size, dark: fg })
      .then((url) => { if (alive) setSrc(url); })
      .catch(() => { if (alive) { setSrc(''); setError(true); } });
    return () => { alive = false; };
  }, [value, fg, size]);

  if (error) return <div className="panel-note">This content is too long for a QR code. Shorten the text or remove a link.</div>;
  if (!src) return <div className="panel-note">Preparing QR…</div>;
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={src} alt={label || 'QR code'} style={{ width: '100%', maxWidth: 280, height: 'auto', borderRadius: 12 }} />
      {label && <div className="panel-note" style={{ wordBreak: 'break-all' }}>{label}</div>}
    </div>
  );
};

export const DownloadRow = ({ children }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, justifyContent: 'center' }}>{children}</div>
);
