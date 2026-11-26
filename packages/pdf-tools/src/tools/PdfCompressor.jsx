import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { formatBytes } from '../shared/text';

const LEVELS = {
  lossless: { label: 'Lossless — keeps selectable text', scale: 0, quality: 0 },
  balanced: { label: 'Balanced — good quality, smaller file', scale: 1.2, quality: 0.72 },
  strong: { label: 'Strong — smallest file, flattened pages', scale: 0.9, quality: 0.5 }
};

const TARGETS = [100, 200, 300, 500, 1000, 2000];
const ATTEMPTS = [
  { scale: 1.6, quality: 0.85 },
  { scale: 1.35, quality: 0.7 },
  { scale: 1.1, quality: 0.55 },
  { scale: 0.9, quality: 0.42 },
  { scale: 0.75, quality: 0.3 }
];

const PdfCompressor = () => {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('balanced');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, size, pages, targetMet }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    setStatus('');
    e.target.value = '';
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setStatus('Reading PDF…');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfjs = await loadPdfjs();

      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const targetBytes = Number(target) * 1024 || 0;
      let outBytes;
      let pages = 0;
      let targetMet = null;

      if (level === 'lossless' && !targetBytes) {
        const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
        pages = doc.getPageCount();
        doc.setTitle('');
        doc.setAuthor('');
        doc.setSubject('');
        doc.setProducer('3toOne');
        doc.setCreator('3toOne');
        outBytes = await doc.save({ useObjectStreams: true });
      } else {
        const task = pdfjs.getDocument({ data: srcBytes.slice() });
        const pdf = await task.promise;
        pages = pdf.numPages;
        const canvasList = [];

        setStatus(`Rendering ${pages} page${pages > 1 ? 's' : ''}…`);
        for (let i = 1; i <= pages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d', { alpha: false });
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, canvasContext: ctx, viewport, background: '#ffffff' }).promise;
          canvasList.push({ canvas, width: viewport.width / 1.6, height: viewport.height / 1.6 });
          page.cleanup();
        }

        const build = async (attempt) => {
          const out = await PDFDocument.create();
          for (const item of canvasList) {
            const ratio = attempt.scale / 1.6;
            const w = Math.max(1, Math.round(item.canvas.width * ratio));
            const h = Math.max(1, Math.round(item.canvas.height * ratio));
            const scaled = document.createElement('canvas');
            scaled.width = w;
            scaled.height = h;
            const sctx = scaled.getContext('2d', { alpha: false });
            sctx.fillStyle = '#ffffff';
            sctx.fillRect(0, 0, w, h);
            sctx.drawImage(item.canvas, 0, 0, w, h);
            const dataUrl = scaled.toDataURL('image/jpeg', attempt.quality);
            const jpg = await out.embedJpg(dataUrl);
            const p = out.addPage([item.width, item.height]);
            p.drawImage(jpg, { x: 0, y: 0, width: item.width, height: item.height });
            scaled.width = 0;
            scaled.height = 0;
          }
          out.setProducer('3toOne');
          return out.save({ useObjectStreams: true });
        };

        if (targetBytes) {
          for (let i = 0; i < ATTEMPTS.length; i++) {
            setStatus(`Trying quality ${i + 1}/${ATTEMPTS.length} to reach ${formatBytes(targetBytes)}…`);
            outBytes = await build(ATTEMPTS[i]);
            if (outBytes.length <= targetBytes) {
              targetMet = true;
              break;
            }
            targetMet = false;
          }
        } else {
          const cfg = LEVELS[level];
          outBytes = await build({ scale: cfg.scale, quality: cfg.quality });
        }

        canvasList.forEach(({ canvas }) => { canvas.width = 0; canvas.height = 0; });
        await task.destroy();
      }

      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        size: outBytes.length,
        pages,
        targetMet
      });
      setStatus('');
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
    a.download = `${file.name.replace(/\.pdf$/i, '')}-compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saved = result && file ? Math.round(((file.size - result.size) / file.size) * 100) : 0;

  return (
    <ToolLayout title="PDF Compressor" description="Shrink a PDF, or aim for an exact upload limit like 200 KB.">
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
            <div className="control-group grow">
              <label className="tool-label">Target size (optional)</label>
              <select className="tool-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">No target — use the level above</option>
                {TARGETS.map((kb) => <option key={kb} value={kb}>{kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}</option>)}
              </select>
            </div>
          </div>
        </div>

        {file && !result && (
          <p className="form-note">Original size: {formatBytes(file.size)}{target ? ` · target ${target} KB` : ''}</p>
        )}
        {status && <p className="form-note">{status}</p>}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={compress} disabled={busy || !file}>
            {busy ? 'Compressing…' : target ? `Compress to ${Number(target) >= 1000 ? `${Number(target) / 1000} MB` : `${target} KB`}` : 'Compress PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download compressed PDF</button>}
        </div>

        {result && (
          <>
            <div className="control-row stats-row">
              <div className="stat-card"><div className="stat-value">{formatBytes(file.size)}</div><div className="stat-label">Original</div></div>
              <div className="stat-card"><div className="stat-value">{formatBytes(result.size)}</div><div className="stat-label">Compressed</div></div>
              <div className="stat-card"><div className="stat-value">{saved > 0 ? `${saved}%` : '—'}</div><div className="stat-label">Saved</div></div>
              <div className="stat-card"><div className="stat-value">{result.pages}</div><div className="stat-label">Pages</div></div>
            </div>
            {result.targetMet === false && (
              <p className="form-note">
                Could not reach {target} KB without destroying the pages — this is the smallest usable version.
              </p>
            )}
            {result.targetMet === true && (
              <p className="form-note">Target met — the file is under {target} KB.</p>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfCompressor;
