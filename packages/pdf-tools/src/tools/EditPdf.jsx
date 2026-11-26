import { useMemo, useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { renderPdfPages } from '../shared/pdfjs';

const COLORS = {
  black: [0, 0, 0],
  red: [0.8, 0.1, 0.15],
  blue: [0.1, 0.28, 0.75],
  white: [1, 1, 1]
};

const EditPdf = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({ text: 'New text', size: 14, color: 'black', whiteout: false });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const page = useMemo(() => pages.find((p) => p.index === pageNo), [pages, pageNo]);
  const scale = page ? Math.min(1, 640 / page.width) : 1;
  const selected = items.find((i) => i.id === selectedId) || null;

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setItems([]);
    setSelectedId(null);
    setResultUrl(null);
    setError('');
    setLoading(true);
    try {
      const rendered = await renderPdfPages(f, { scale: 1.5 });
      setPages(rendered);
      setPageNo(1);
    } catch {
      setError('Could not read this PDF — it may be corrupted or password-protected.');
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  const addAt = (e) => {
    if (!page) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const item = {
      id: `e${Date.now().toString(36)}`,
      page: page.index,
      x: Math.max(4, Math.min(x, page.width - 40)),
      y: Math.max(4, Math.min(y, page.height - 10)),
      ...draft
    };
    setItems((prev) => [...prev, item]);
    setSelectedId(item.id);
  };

  const update = (patch) =>
    setItems((prev) => prev.map((i) => (i.id === selectedId ? { ...i, ...patch } : i)));

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const convert = async () => {
    if (!file || !items.length) {
      setError('Click on the page to add at least one text box.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pdfPages = doc.getPages();

      for (const item of items) {
        const target = pdfPages[item.page - 1];
        if (!target) continue;
        const { height } = target.getSize();
        const color = COLORS[item.color] || COLORS.black;
        const text = String(item.text || '').replace(/[\r\n]+/g, ' ');
        if (item.whiteout) {
          const w = Math.max(60, font.widthOfTextAtSize(text, item.size) + 14);
          target.drawRectangle({
            x: item.x - 5,
            y: height - item.y - item.size * 1.3,
            width: w,
            height: item.size * 1.45,
            color: rgb(1, 1, 1),
            opacity: 0.96
          });
        }
        if (text.trim()) {
          target.drawText(text, {
            x: item.x,
            y: height - item.y - item.size,
            size: item.size,
            font,
            color: rgb(...color)
          });
        }
      }

      const outBytes = await doc.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not save the edits.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-edited.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Edit PDF" description="Click anywhere on a page to add text, cover something with whiteout, then download.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {loading && <p className="form-note">Rendering pages…</p>}

        {pages.length > 0 && (
          <>
            <div className="control-row">
              <div className="control-group">
                <label className="tool-label">Page</label>
                <select className="tool-input" value={pageNo} onChange={(e) => setPageNo(Number(e.target.value))}>
                  {pages.map((p) => <option key={p.index} value={p.index}>Page {p.index}</option>)}
                </select>
              </div>
              <div className="control-group grow">
                <label className="tool-label">New text style</label>
                <div className="control-row">
                  <input className="tool-input" type="text" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Text to add" />
                  <input className="tool-input" type="number" min="6" max="72" value={draft.size} onChange={(e) => setDraft({ ...draft, size: Math.max(6, Number(e.target.value) || 12) })} style={{ maxWidth: 80 }} />
                  <select className="tool-input" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })}>
                    {Object.keys(COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <label className="tool-label" style={{ display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={draft.whiteout} onChange={(e) => setDraft({ ...draft, whiteout: e.target.checked })} />
                    Whiteout
                  </label>
                </div>
              </div>
            </div>

            <p className="form-note">Click the page where the text should go. Click a box to edit it.</p>
            <div className="edit-page-wrap">
              <div
                className="edit-page"
                style={{ width: page.width * scale, height: page.height * scale }}
                onClick={addAt}
              >
                <img src={page.url} alt={`Page ${page.index}`} draggable={false} />
                {items.filter((i) => i.page === page.index).map((item) => (
                  <span
                    key={item.id}
                    className={`edit-item ${selectedId === item.id ? 'selected' : ''}`}
                    style={{
                      left: item.x * scale,
                      top: item.y * scale,
                      fontSize: item.size * scale,
                      color: item.color === 'white' ? '#fff' : item.color,
                      background: item.whiteout ? 'rgba(255,255,255,0.9)' : 'transparent'
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            {selected && (
              <div className="control-row">
                <div className="control-group grow">
                  <label className="tool-label">Selected text</label>
                  <input className="tool-input" type="text" value={selected.text} onChange={(e) => update({ text: e.target.value })} />
                </div>
                <div className="control-group">
                  <label className="tool-label">Size</label>
                  <input className="tool-input" type="number" min="6" max="72" value={selected.size} onChange={(e) => update({ size: Math.max(6, Number(e.target.value) || 12) })} />
                </div>
                <div className="control-group">
                  <label className="tool-label">Colour</label>
                  <select className="tool-input" value={selected.color} onChange={(e) => update({ color: e.target.value })}>
                    {Object.keys(COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="tool-btn" onClick={() => removeItem(selected.id)}>Delete</button>
              </div>
            )}
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !items.length}>
            {busy ? 'Saving…' : `Save ${items.length} edit${items.length === 1 ? '' : 's'}`}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download edited PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default EditPdf;
