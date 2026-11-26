import { useRef, useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { saveBlob, baseName } from '../shared/download';

const LANGS = [
  { value: 'eng', label: 'English' },
  { value: 'hin', label: 'Hindi (हिन्दी)' },
  { value: 'eng+hin', label: 'English + Hindi' }
];

const OcrPdf = () => {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState('eng');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // { page, total, status, pct }
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { pdfUrl, text, pages, confidence }
  const workerRef = useRef(null);

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    setProgress(null);
    e.target.value = '';
  };

  const cancel = async () => {
    try { await workerRef.current?.terminate(); } catch { /* ignore */ }
    workerRef.current = null;
    setBusy(false);
    setProgress(null);
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: bytes.slice() });
      const pdf = await task.promise;
      const total = pdf.numPages;

      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress((prev) => ({ ...(prev || {}), status: 'Recognising text', pct: Math.round((m.progress || 0) * 100) }));
          } else {
            setProgress((prev) => ({ ...(prev || {}), status: m.status, pct: undefined }));
          }
        }
      });
      workerRef.current = worker;

      const pagePdfs = [];
      const texts = [];
      let confidenceSum = 0;

      for (let i = 1; i <= total; i++) {
        setProgress({ page: i, total, status: 'Rendering page', pct: 0 });
        const page = await pdf.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(2.5, Math.max(1.4, 2200 / base.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport, background: '#ffffff' }).promise;
        page.cleanup();

        setProgress({ page: i, total, status: 'Recognising text', pct: 0 });
        const { data } = await worker.recognize(canvas, {}, { pdf: true, text: true });
        if (data.pdf) pagePdfs.push(data.pdf);
        texts.push(`--- Page ${i} ---\n${(data.text || '').trim()}`);
        confidenceSum += data.confidence || 0;
        canvas.width = 0;
        canvas.height = 0;
      }

      await task.destroy();
      await worker.terminate();
      workerRef.current = null;

      let pdfUrl = null;
      if (pagePdfs.length) {
        const { PDFDocument } = await import('pdf-lib');
        const out = await PDFDocument.create();
        for (const pageBytes of pagePdfs) {
          const src = await PDFDocument.load(new Uint8Array(pageBytes));
          const copied = await out.copyPages(src, src.getPageIndices());
          copied.forEach((p) => out.addPage(p));
        }
        out.setTitle(`${baseName(file.name, 'pdf')} (OCR)`);
        out.setProducer('3toOne');
        out.setCreator('3toOne');
        const merged = await out.save({ useObjectStreams: true });
        pdfUrl = URL.createObjectURL(new Blob([merged], { type: 'application/pdf' }));
      }

      setResult({
        pdfUrl,
        text: texts.join('\n\n'),
        pages: total,
        confidence: Math.round(confidenceSum / total)
      });
      setProgress(null);
    } catch (err) {
      console.error(err);
      setError(
        /fetch|network|Failed to load|lang/i.test(err.message || '')
          ? 'Could not download the OCR language data. Check your connection and try again.'
          : err.message || 'OCR failed on this PDF.'
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = () => {
    if (!result?.pdfUrl) return;
    const a = document.createElement('a');
    a.href = result.pdfUrl;
    a.download = `${baseName(file.name, 'pdf')}-ocr.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadText = () => {
    if (!result?.text) return;
    saveBlob(new Blob([result.text], { type: 'text/plain' }), `${baseName(file.name, 'pdf')}.txt`);
  };

  return (
    <ToolLayout title="OCR PDF" description="Turn scanned pages into searchable, copyable PDFs — English, Hindi or both.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Scanned PDF</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Language</label>
              <select className="tool-input" value={lang} onChange={(e) => setLang(e.target.value)} disabled={busy}>
                {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {progress && (
          <p className="form-note">
            {progress.total ? `Page ${progress.page} of ${progress.total} · ` : ''}
            {progress.status}
            {progress.pct !== undefined ? ` (${progress.pct}%)` : '…'}
          </p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={run} disabled={busy || !file}>
            {busy ? 'Running OCR…' : 'Run OCR'}
          </button>
          {busy && <button className="tool-btn" onClick={cancel}>Cancel</button>}
          {result?.pdfUrl && <button className="tool-btn" onClick={downloadPdf}>Download searchable PDF</button>}
          {result?.text && <button className="tool-btn" onClick={downloadText}>Download .txt</button>}
        </div>

        {result && (
          <>
            <p className="form-note">
              {result.pages} page{result.pages > 1 ? 's' : ''} recognised · average confidence {result.confidence}%.
              The PDF keeps the original page image with an invisible searchable text layer.
            </p>
            <div className="text-output">
              <textarea className="tool-textarea" value={result.text} readOnly spellCheck={false} />
            </div>
          </>
        )}

        <p className="form-note">
          OCR runs in your browser with tesseract.js. Language data is fetched once (a few MB) and can take a while on
          long documents — everything stays on your device.
        </p>
      </div>
    </ToolLayout>
  );
};

export default OcrPdf;
