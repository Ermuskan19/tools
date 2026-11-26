import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const ReorderPdfPages = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setOrder([]);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setOrder(Array.from({ length: doc.getPageCount() }, (_, i) => i));
    } catch {
      setError('Could not read this PDF.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file || pageCount === 0 || order.length !== pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, src.getPageIndices());
      order.forEach((idx) => out.addPage(copied[idx]));
      const bytes = await out.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
    } catch (err) {
      setError(err.message || 'Reorder failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'reordered.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const move = (i, dir) => {
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  return (
    <ToolLayout title="Reorder PDF Pages" description="Drag pages into place.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && pageCount > 0 && (
          <>
            <p className="form-note">{pageCount} page{pageCount > 1 ? 's' : ''} — drag to reorder</p>
            <div className="page-grid">
              {order.map((idx, position) => (
                <div key={position} className="page-thumb reorder-thumb">
                  <span className="page-num">{position + 1}</span>
                  <span className="page-idx">#{idx + 1}</span>
                </div>
              ))}
            </div>
            <div className="order-controls">
              {order.map((idx, position) => (
                <div key={position} className="order-row">
                  <span className="order-num">{position + 1}</span>
                  <span className="order-idx">Page {idx + 1}</span>
                  <button
                    className="icon-btn"
                    onClick={() => move(position, -1)}
                    disabled={position === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => move(position, 1)}
                    disabled={position === pageCount - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0}>
            {busy ? 'Reordering…' : 'Reorder PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default ReorderPdfPages;
