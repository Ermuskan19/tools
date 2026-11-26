import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { qrSvg, downloadSvg } from '../lib/qr';

const FIELDS_BY_SLUG = {
  'upi-qr-generator': [
    { key: 'upiId', label: 'UPI ID', placeholder: 'yourshop@bank', type: 'text' },
    { key: 'name', label: 'Shop / payee name', placeholder: 'Your shop name', type: 'text' },
    { key: 'amount', label: 'Amount (optional)', placeholder: '250', type: 'text' },
    { key: 'note', label: 'Note (optional)', placeholder: 'Payment for order', type: 'text' },
  ],
  'whatsapp-chat-qr': [
    { key: 'phone', label: 'Phone with country code', placeholder: '919876543210', type: 'text' },
    { key: 'message', label: 'Pre-filled message', placeholder: 'Hi, I would like to know more', type: 'text' },
  ],
  'google-review-qr': [
    { key: 'link', label: 'Google review link', placeholder: 'Paste your review link', type: 'text' },
    { key: 'name', label: 'Business name', placeholder: 'Your business', type: 'text' },
  ],
  'menu-qr': [
    { key: 'name', label: 'Restaurant name', placeholder: 'Your restaurant', type: 'text' },
    { key: 'link', label: 'Menu link', placeholder: 'https://', type: 'text' },
  ],
  'wifi-qr': [
    { key: 'ssid', label: 'Network name (SSID)', placeholder: 'Your Wi-Fi name', type: 'text' },
    { key: 'password', label: 'Password', placeholder: 'Your Wi-Fi password', type: 'text' },
    { key: 'security', label: 'Security', placeholder: 'WPA', type: 'text' },
  ],
  'vcard-qr': [
    { key: 'name', label: 'Full name', placeholder: 'Your name', type: 'text' },
    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'text' },
    { key: 'org', label: 'Organisation', placeholder: 'Your company', type: 'text' },
  ],
};

const REQUIRED_FIELD = {
  'upi-qr-generator': 'upiId',
  'whatsapp-chat-qr': 'phone',
  'google-review-qr': 'link',
  'menu-qr': 'link',
  'wifi-qr': 'ssid',
  'vcard-qr': 'name'
};

const escapeWifi = (value) => String(value || '').replace(/([\\;,:"])/g, '\\$1');
const escapeVcard = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const buildPayload = (slug, vals) => {
  switch (slug) {
    case 'upi-qr-generator': {
      const { upiId, name, amount, note } = vals;
      let s = `upi://pay?pa=${encodeURIComponent(upiId || '')}`;
      if (name) s += `&pn=${encodeURIComponent(name)}`;
      if (amount) s += `&am=${encodeURIComponent(amount)}`;
      s += '&cu=INR';
      if (note) s += `&tn=${encodeURIComponent(note)}`;
      return s;
    }
    case 'whatsapp-chat-qr': {
      const phone = (vals.phone || '').replace(/\D/g, '');
      const msg = vals.message ? `?text=${encodeURIComponent(vals.message)}` : '';
      return `https://wa.me/${phone}${msg}`;
    }
    case 'google-review-qr':
      return vals.link || '';
    case 'menu-qr':
      return vals.link || '';
    case 'wifi-qr': {
      const sec = vals.security || 'WPA';
      return `WIFI:T:${sec};S:${escapeWifi(vals.ssid)};P:${escapeWifi(vals.password)};;`;
    }
    case 'vcard-qr': {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      if (vals.name) lines.push(`FN:${escapeVcard(vals.name)}`);
      if (vals.phone) lines.push(`TEL:${escapeVcard(vals.phone)}`);
      if (vals.email) lines.push(`EMAIL:${escapeVcard(vals.email)}`);
      if (vals.org) lines.push(`ORG:${escapeVcard(vals.org)}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'url':
    default:
      return vals.text || '';
  }
};

const defaultFields = [{ key: 'text', label: 'Text or URL', placeholder: 'https:// or any text', type: 'text' }];

export const QrTool = ({ slug, title }) => {
  const fields = FIELDS_BY_SLUG[slug] || defaultFields;
  const [vals, setVals] = useState(() => {
    const init = {};
    fields.forEach((f) => (init[f.key] = ''));
    if (fields.length === 1) init.text = 'https://3toone.in';
    return init;
  });
  const [fg, setFg] = useState('#0F766E');
  const [size, setSize] = useState(256);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const canvasRef = useRef(null);

  const payload = buildPayload(slug, vals);
  const requiredKey = REQUIRED_FIELD[slug];
  const canGenerate = Boolean(payload.trim()) && (!requiredKey || Boolean(String(vals[requiredKey] || '').trim()));

  const generate = useCallback(async () => {
    setError('');
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!canGenerate) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        setReady(false);
        return;
      }
      await QRCode.toCanvas(canvas, payload, { width: size, margin: 2, color: { dark: fg, light: '#ffffff' } });
      setReady(true);
    } catch (e) {
      setError(e?.message || 'Failed to generate QR');
      setReady(false);
    }
  }, [payload, canGenerate, fg, size]);

  useEffect(() => {
    generate();
  }, [generate]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'qr'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSvgFile = async () => {
    if (!payload.trim()) return;
    try {
      const svg = await qrSvg(payload, { dark: fg });
      downloadSvg(svg, `${slug || 'qr'}.svg`);
    } catch (e) {
      setError(e?.message || 'Failed to export SVG');
    }
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      setError('Could not copy. Select the text and copy manually.');
    }
  };

  const update = (key, value) => setVals((v) => ({ ...v, [key]: value }));

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Details</h2><span className="live-pill">Live</span></div>
          {fields.map((f) => (
            <div className="cal-field" key={f.key}>
              <label className="field-label">{f.label}</label>
              <div className="number-box wide">
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={vals[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              </div>
            </div>
          ))}
          <div className="cal-field">
            <label className="field-label">Foreground colour</label>
            <div className="number-box wide">
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{fg}</span>
            </div>
          </div>
          <div className="cal-field">
            <label className="field-label">Size (px)</label>
            <div className="number-box wide">
              <input type="number" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(Math.max(128, Number(e.target.value) || 256))} />
            </div>
          </div>
          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Preview</h2><span className="live-pill">Live</span></div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <div className="stat-grid dark">
            <div className="stat"><span>Payload</span><b style={{ fontSize: 12, wordBreak: 'break-all' }}>{canGenerate ? `${payload.slice(0, 80)}${payload.length > 80 ? '…' : ''}` : 'Enter the details to build your QR'}</b></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn solid" onClick={download} disabled={!ready}>Download PNG</button>
            <button type="button" className="btn" onClick={downloadSvgFile} disabled={!canGenerate}>Download SVG</button>
            <button type="button" className="btn" onClick={copyPayload} disabled={!canGenerate}>Copy content</button>
          </div>
          <p className="panel-note">Scan with your phone camera to test before printing. Static QR codes never expire.</p>
        </div>
      </div>
    </section>
  );
};

export default QrTool;
