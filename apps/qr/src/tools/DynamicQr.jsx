import { useEffect, useMemo, useState } from 'react';
import { qrDataUrl, qrSvg, downloadUrl, downloadSvg } from '../lib/qr';

const KEY = '3toone-dynamic-qr';
const newId = () => (globalThis.crypto?.randomUUID?.() || `qr-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const hasTarget = (value) => Boolean(String(value || '').trim()) && !/^https?:\/\/$/i.test(String(value || '').trim());

const readRecords = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRecords = (records) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(records)); } catch { /* private mode */ }
};

export const DynamicQr = () => {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('Shop menu');
  const [target, setTarget] = useState('https://');
  const [color, setColor] = useState('#0F766E');
  const [src, setSrc] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = readRecords();
    setRecords(stored);
    if (stored[0]) setSelectedId(stored[0].id);
  }, []);

  const selected = useMemo(() => records.find((r) => r.id === selectedId) || null, [records, selectedId]);

  useEffect(() => {
    if (!selected?.target) { setSrc(''); return; }
    let alive = true;
    qrDataUrl(selected.target, { size: 640, dark: selected.color || '#0F766E' })
      .then((url) => { if (alive) setSrc(url); })
      .catch(() => { if (alive) setSrc(''); });
    return () => { alive = false; };
  }, [selected]);

  const persist = (next) => {
    setRecords(next);
    saveRecords(next);
  };

  const create = () => {
    if (!hasTarget(target)) { setMessage('Add a destination first.'); return; }
    const record = { id: newId(), name: name.trim() || 'Untitled QR', target: target.trim(), color, createdAt: Date.now(), updatedAt: Date.now() };
    persist([record, ...records]);
    setSelectedId(record.id);
    setMessage('QR saved on this device.');
  };

  const update = () => {
    if (!selected) return;
    if (!hasTarget(target)) { setMessage('Add a destination first.'); return; }
    const next = records.map((r) => r.id === selected.id ? { ...r, name: name.trim() || r.name, target: target.trim(), color, updatedAt: Date.now() } : r);
    persist(next);
    setMessage('Destination updated. Download the QR again if you print it.');
  };

  const choose = (record) => {
    setSelectedId(record.id);
    setName(record.name);
    setTarget(record.target);
    setColor(record.color || '#0F766E');
    setMessage('');
  };

  const remove = (id) => {
    const next = records.filter((r) => r.id !== id);
    persist(next);
    if (selectedId === id) setSelectedId(next[0]?.id || '');
    setMessage('QR removed from this device.');
  };

  const downloadPng = () => {
    if (!src) return;
    downloadUrl(src, `dynamic-${selected?.id || 'qr'}.png`);
  };

  const downloadSvg = async () => {
    if (!selected) return;
    try {
      const svg = await qrSvg(selected.target, { dark: selected.color || '#0F766E' });
      downloadSvg(svg, `dynamic-${selected.id}.svg`);
    } catch {
      setMessage('Could not export SVG.');
    }
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your QR library</h2><span className="live-pill">On this device</span></div>
          <div className="cal-field">
            <label className="field-label">Name</label>
            <div className="number-box wide"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop menu" /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Destination URL or text</label>
            <div className="number-box wide"><input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://" /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">QR colour</label>
            <div className="number-box wide">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{color}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn solid" onClick={create}>Save new QR</button>
            <button type="button" className="btn" onClick={update} disabled={!selected}>Update selected</button>
          </div>
          {message && <p className="panel-note">{message}</p>}

          <div style={{ marginTop: 20 }}>
            <div className="field-label" style={{ marginBottom: 8 }}>Saved QR codes ({records.length})</div>
            {records.length === 0 ? (
              <p className="panel-note">Nothing saved yet. Create your first QR above.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {records.map((r) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d1fae5', borderRadius: 10, padding: 8, background: r.id === selectedId ? '#ecfdf5' : '#fff' }}>
                    <button type="button" className="btn small" onClick={() => choose(r)} style={{ flex: 1, textAlign: 'left' }}>{r.name}</button>
                    <button type="button" className="btn small" onClick={() => remove(r.id)} aria-label={`Delete ${r.name}`}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Selected QR</h2><span className="live-pill">Live</span></div>
          {selected ? (
            <>
              <div style={{ background: '#fff', borderRadius: 14, padding: 12, display: 'grid', placeItems: 'center' }}>
                {src ? <img src={src} alt={`QR for ${selected.name}`} style={{ width: '100%', maxWidth: 300 }} /> : <span className="panel-note">Preparing QR…</span>}
              </div>
              <div className="stat-grid dark" style={{ marginTop: 12 }}>
                <div className="stat"><span>Name</span><b>{selected.name}</b></div>
                <div className="stat"><span>Updated</span><b>{new Date(selected.updatedAt).toLocaleDateString()}</b></div>
              </div>
              <p className="panel-note" style={{ wordBreak: 'break-all' }}>{selected.target}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
                <button type="button" className="btn solid" onClick={downloadPng} disabled={!src}>Download PNG</button>
                <button type="button" className="btn" onClick={downloadSvg}>Download SVG</button>
                {/^https?:\/\//i.test(selected.target) && <a className="btn" href={selected.target} target="_blank" rel="noopener noreferrer nofollow">Open link</a>}
              </div>
              <p className="panel-note">
                This tool stores QR records in this browser. Editing a destination updates the QR you download here; a hosted redirect that changes an already-printed code needs a short-link service.
              </p>
            </>
          ) : (
            <div className="empty-panel">Save a QR to preview and download it here.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DynamicQr;
