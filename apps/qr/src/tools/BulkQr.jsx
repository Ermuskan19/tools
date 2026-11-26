import { useState } from 'react';
import JSZip from 'jszip';
import { qrDataUrl, downloadUrl } from '../lib/qr';

const MAX = 50;

const parseRows = (text) => text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const sep = line.includes('\t') ? '\t' : ',';
    const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
    return { value: cols[0] || '', name: cols[1] || '' };
  })
  .filter((row) => row.value);

const safeName = (name, index) => {
  const base = (name || `qr-${String(index + 1).padStart(2, '0')}`)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return `${base || `qr-${index + 1}`}.png`;
};

export const BulkQr = () => {
  const [input, setInput] = useState('https://3toone.in,home\nhttps://3toone.in/calc,calculators\nhttps://3toone.in/qr,qr-tools');
  const [fg, setFg] = useState('#0F766E');
  const [size, setSize] = useState(512);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    const rows = parseRows(input);
    setError('');
    if (!rows.length) { setError('Add at least one value, one per line.'); setItems([]); return; }
    if (rows.length > MAX) { setError(`This tool supports up to ${MAX} QR codes at a time.`); return; }
    setBusy(true);
    try {
      const next = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const url = await qrDataUrl(row.value, { size, dark: fg });
        next.push({ ...row, url, filename: safeName(row.name, i) });
      }
      setItems(next);
    } catch (e) {
      setError(e?.message || 'Could not generate the QR codes.');
      setItems([]);
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!items.length) return;
    setBusy(true);
    setError('');
    try {
      const zip = new JSZip();
      items.forEach((item) => {
        const base64 = item.url.split(',')[1] || '';
        zip.file(item.filename, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      downloadUrl(url, '3toone-qr-codes.zip');
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {
      setError(e?.message || 'Could not build the ZIP file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Bulk details</h2><span className="live-pill">CSV</span></div>
          <div className="cal-field">
            <label className="field-label">One QR per line: value, file name</label>
            <div className="number-box wide" style={{ alignItems: 'stretch' }}>
              <textarea
                rows={9}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                style={{ width: '100%', border: 0, outline: 0, resize: 'vertical', font: '13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace', background: 'transparent' }}
              />
            </div>
            <p className="panel-note">Values can be URLs, text, UPI links or Wi-Fi strings. Up to {MAX} rows.</p>
          </div>
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
              <input type="number" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(Math.max(128, Math.min(1024, Number(e.target.value) || 512)))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn solid" onClick={generate} disabled={busy}>{busy ? 'Generating…' : 'Generate QRs'}</button>
            <button type="button" className="btn" onClick={downloadZip} disabled={busy || !items.length}>Download ZIP</button>
          </div>
          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Preview</h2><span className="live-pill">{items.length} ready</span></div>
          {items.length === 0 ? (
            <div className="empty-panel">Paste your values and generate to preview every QR here.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
              {items.map((item) => (
                <div key={item.filename} style={{ background: '#fff', borderRadius: 10, padding: 8, textAlign: 'center' }}>
                  <img src={item.url} alt={item.filename} style={{ width: '100%', height: 'auto' }} />
                  <div style={{ fontSize: 11, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }} title={item.value}>{item.value}</div>
                  <div style={{ fontSize: 10, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</div>
                </div>
              ))}
            </div>
          )}
          <p className="panel-note">The ZIP contains one PNG per row. Nothing is uploaded.</p>
        </div>
      </div>
    </section>
  );
};

export default BulkQr;
