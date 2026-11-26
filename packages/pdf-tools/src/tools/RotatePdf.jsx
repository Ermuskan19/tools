import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const RotatePdf = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotations, setRotations] = useState(new Map());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setRotations(new Map());
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

  const setRotation = (i, deg) => {
    setRotations((prev) => {
      const next = new Map(prev);
      next.set(i, deg);
      return next;
    });
  };

  const convert = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, degrees } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, src.getPageIndices());
      for (let i = 0; i < pageCount; i++) {
        const deg = rotations.get(i) || 0;
        if (deg !== 0) copied[i].setRotation(degrees(deg));
      }
      const bytes = await out.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
    } catch (err) {
      setError(err.message || 'Rotate failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'rotated.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Rotate PDF" description="Fix page orientation.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && pageCount > 0 && (
          <>
            <p className="form-note">{pageCount} page{pageCount > 1 ? 's' : ''} — set rotation per page</p>
            <div className="page-grid">
              {Array.from({ length: pageCount }).map((_, i) => (
                <div key={i} className="page-rotate-card">
                  <div className="page-label">Page {i + 1}</div>
                  <select
                    className="tool-input"
                    value={rotations.get(i) || 0}
                    onChange={(e) => setRotation(i, Number(e.target.value))}
                  >
                    <option value="0">0°</option>
                    <option value="90">90°</option>
                    <option value="180">180°</option>
                    <option value="270">270°</option>
                  </select>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0}>
            {busy ? 'Rotating…' : 'Rotate PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default RotatePdf;
