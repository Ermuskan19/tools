import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { downloadZip, dataUrlToBytes } from '../shared/zip';

const PdfToJpg = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pages, setPages] = useState([]); // { url, name, index }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setPages([]);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfjs = await loadPdfjs();
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: srcBytes.slice() });
      const pdf = await task.promise;

      const results = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        results.push({ url: dataUrl, name: `${file.name.replace(/\.pdf$/i, '')}-page-${i}.jpg`, index: i });
        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
      }
      await task.destroy();
      setPages(results);
    } catch (err) {
      console.error(err);
      setError('Could not convert PDF to JPG — it may be corrupted or too large.');
    } finally {
      setBusy(false);
    }
  };

  const download = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [zipping, setZipping] = useState(false);
  const downloadAll = async () => {
    setZipping(true);
    try {
      await downloadZip(
        pages.map((p) => ({ name: p.name, data: dataUrlToBytes(p.url) })),
        `${file.name.replace(/\.pdf$/i, '')}-images.zip`
      );
    } finally {
      setZipping(false);
    }
  };

  return (
    <ToolLayout title="PDF to JPG" description="Convert PDF pages to sharp JPG images.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && !pages.length && !busy && (
          <p className="form-note">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Converting…' : 'Convert to JPG'}
          </button>
          {pages.length > 0 && (
            <button className="tool-btn" onClick={downloadAll} disabled={zipping}>
              {zipping ? 'Zipping…' : `Download all as ZIP (${pages.length})`}
            </button>
          )}
        </div>

        {pages.length > 0 && (
          <div className="image-preview-grid">
            {pages.map((p) => (
              <div key={p.index} className="preview-card">
                <img src={p.url} alt={`Page ${p.index}`} />
                <div className="preview-label">{p.name}</div>
                <button className="tool-btn" onClick={() => download(p.url, p.name)} style={{ marginTop: 8 }}>
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToJpg;
