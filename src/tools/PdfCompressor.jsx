import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

// Levels: 'lossless' keeps text/vectors untouched (re-save with object streams);
// 'balanced' / 'strong' re-render pages to JPEG at decreasing quality.
const LEVELS = {
  lossless: { label: 'Lossless — keeps selectable text', scale: 0, quality: 0 },
  balanced: { label: 'Balanced — good quality, smaller file', scale: 1.2, quality: 0.72 },
  strong: { label: 'Strong — smallest file, flattened pages', scale: 0.9, quality: 0.5 }
};

const PdfCompressor = () => {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('balanced');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, size, pages }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    e.target.value = '';
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const cfg = LEVELS[level];
      let outBytes;
      let pages = 0;

      if (cfg.scale === 0) {
        const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
        pages = doc.getPageCount();
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setProducer('3toOne');
        doc.setCreator('3toOne');
        outBytes = await doc.save({ useObjectStreams: true });
      } else {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
        const task = pdfjs.getDocument({ data: srcBytes.slice() });
        const pdf = await task.promise;
        pages = pdf.numPages;
        const out = await PDFDocument.create();

        for (let i = 1; i <= pages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: cfg.scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, background: '#ffffff' }).promise;

          const dataUrl = canvas.toDataURL('image/jpeg', cfg.quality);
          const jpg = await out.embedJpg(dataUrl);
          const p = out.addPage([viewport.width / cfg.scale, viewport.height / cfg.scale]);
          p.drawImage(jpg, { x: 0, y: 0, width: viewport.width / cfg.scale, height: viewport.height / cfg.scale });
          page.cleanup();
          canvas.width = 0;
          canvas.height = 0;
        }
        out.setProducer('3toOne');
        outBytes = await out.save({ useObjectStreams: true });
        await pdf.destroy();
      }

      if (result) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        size: outBytes.length,
        pages
      });
    } catch (err) {
      console.error(err);
      setError('Could not compress this PDF — it may be corrupted, encrypted, or too large for browser memory.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = 'compressed.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saved = result && file ? Math.round(((file.size - result.size) / file.size) * 100) : 0;

  return (
    <ToolLayout title="PDF Compressor" description="Shrink PDF file size for email and upload limits, right in your browser.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Compression level</label>
              <select className="tool-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {file && !result && (
          <p className="form-note">Original size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={compress} disabled={busy || !file}>
            {busy ? 'Compressing…' : 'Compress PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download compressed PDF</button>}
        </div>

        {result && (
          <div className="control-row stats-row">
            <div className="stat-card"><div className="stat-value">{(file.size / 1024 / 1024).toFixed(2)} MB</div><div className="stat-label">Original</div></div>
            <div className="stat-card"><div className="stat-value">{(result.size / 1024 / 1024).toFixed(2)} MB</div><div className="stat-label">Compressed</div></div>
            <div className="stat-card"><div className="stat-value">{saved > 0 ? `${saved}%` : '—'}</div><div className="stat-label">Saved</div></div>
            <div className="stat-card"><div className="stat-value">{result.pages}</div><div className="stat-label">Pages</div></div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfCompressor;
