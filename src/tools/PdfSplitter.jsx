import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

// Parses "1-3, 5, 8-10" into a 0-based page index list. Throws on bad input.
const parseRanges = (input, pageCount) => {
  const pages = [];
  for (const part of input.split(',')) {
    const chunk = part.trim();
    if (!chunk) continue;
    const m = chunk.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) throw new Error(`"${chunk}" is not a valid range`);
    const from = parseInt(m[1], 10);
    const to = m[2] ? parseInt(m[2], 10) : from;
    if (from < 1 || to > pageCount || from > to) {
      throw new Error(`Range "${chunk}" is outside 1-${pageCount}`);
    }
    for (let p = from; p <= to; p++) pages.push(p - 1);
  }
  if (!pages.length) throw new Error('Enter at least one page, e.g. 1-3, 5');
  return pages;
};

const PdfSplitter = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState('');
  const [mode, setMode] = useState('range'); // 'range' | 'each'
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
      const n = doc.getPageCount();
      setPageCount(n);
      setRanges(`1-${n}`);
    } catch {
      setError('Could not read this PDF — it may be corrupted or password-protected.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const split = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });

      if (mode === 'range') {
        const idx = parseRanges(ranges, pageCount);
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, idx);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save({ useObjectStreams: true });
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })));
      } else {
        // One file per page, downloaded sequentially (browsers allow chained downloads).
        for (let i = 0; i < pageCount; i++) {
          const out = await PDFDocument.create();
          const [page] = await out.copyPages(src, [i]);
          out.addPage(page);
          const bytes = await out.save();
          const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
          const a = document.createElement('a');
          a.href = url;
          a.download = `${file.name.replace(/\.pdf$/i, '')}-page-${i + 1}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch (err) {
      setError(err.message || 'Split failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'extracted-pages.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="PDF Splitter" description="Split a PDF into smaller files or extract exactly the pages you need.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />

          {file && pageCount > 0 && (
            <div className="control-row">
              <div className="control-group">
                <label className="tool-label">Mode</label>
                <select className="tool-input" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="range">Extract page range into one PDF</option>
                  <option value="each">Split every page into its own file</option>
                </select>
              </div>
              {mode === 'range' && (
                <div className="control-group grow">
                  <label className="tool-label">Pages (of {pageCount})</label>
                  <input className="tool-input" type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 5, 8-10" />
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={split} disabled={busy || !file || !pageCount}>
            {busy ? 'Working…' : mode === 'each' ? `Split ${pageCount} pages` : 'Extract pages'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download result</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default PdfSplitter;
