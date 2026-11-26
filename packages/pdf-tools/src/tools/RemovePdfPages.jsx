import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const RemovePdfPages = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [removeList, setRemoveList] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setRemoveList(new Set());
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setError('Could not read this PDF.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const toggle = (i) => {
    setRemoveList((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const convert = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const keep = [];
      for (let i = 0; i < pageCount; i++) {
        if (!removeList.has(i)) keep.push(i);
      }
      if (keep.length === 0) { setError('Keep at least one page.'); setBusy(false); return; }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keep);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
    } catch (err) {
      setError(err.message || 'Remove failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'pages-removed.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Remove PDF Pages" description="Pick pages to delete.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && pageCount > 0 && (
          <>
            <p className="form-note">{pageCount} page{pageCount > 1 ? 's' : ''} — click pages to remove</p>
            <div className="page-grid">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`page-thumb${removeList.has(i) ? ' page-removed' : ''}`}
                  onClick={() => toggle(i)}
                  title={`Page ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="form-note">{removeList.size} page{removeList.size > 1 ? 's' : ''} selected for removal</p>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0 || removeList.size >= pageCount}>
            {busy ? 'Removing…' : `Remove ${removeList.size} page${removeList.size > 1 ? 's' : ''}`}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default RemovePdfPages;
