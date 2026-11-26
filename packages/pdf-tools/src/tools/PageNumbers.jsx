import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const PageNumbers = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [startFrom, setStartFrom] = useState(1);
  const [position, setPosition] = useState('bottom-center');
  const [format, setFormat] = useState('n');
  const [size, setSize] = useState(11);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
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

  const convert = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const font = await src.embedFont(StandardFonts.Helvetica);
      const pages = src.getPages();
      const margin = 28;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const n = startFrom + i;
        let text = String(n);
        if (format === 'x-of-y') text = `Page ${n} of ${startFrom + pages.length - 1}`;
        if (format === 'dash') text = `— ${n} —`;
        const textWidth = font.widthOfTextAtSize(text, size);

        let x = (width - textWidth) / 2;
        if (position.endsWith('right')) x = width - margin - textWidth;
        if (position.endsWith('left')) x = margin;
        const y = position.startsWith('top') ? height - margin - size : margin;

        page.drawText(text, { x, y, size, font, color: rgb(0.12, 0.12, 0.16) });
      });

      const outBytes = await src.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not add page numbers.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Page Numbers" description="Add page numbers to a PDF — header or footer, left, centre or right.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Position</label>
              <select className="tool-input" value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="bottom-center">Footer · centre</option>
                <option value="bottom-right">Footer · right</option>
                <option value="bottom-left">Footer · left</option>
                <option value="top-center">Header · centre</option>
                <option value="top-right">Header · right</option>
                <option value="top-left">Header · left</option>
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Format</label>
              <select className="tool-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="n">1, 2, 3…</option>
                <option value="x-of-y">Page 1 of 10</option>
                <option value="dash">— 1 —</option>
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Start at</label>
              <input className="tool-input" type="number" min="1" value={startFrom} onChange={(e) => setStartFrom(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div className="control-group">
              <label className="tool-label">Size</label>
              <input className="tool-input" type="number" min="7" max="24" value={size} onChange={(e) => setSize(Math.min(24, Math.max(7, Number(e.target.value) || 11)))} />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0}>
            {busy ? 'Adding numbers…' : `Add numbers to ${pageCount || 0} page${pageCount === 1 ? '' : 's'}`}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default PageNumbers;
