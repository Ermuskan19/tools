import { useState, useRef } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const PdfMerger = () => {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf');
    if (picked.length) {
      setFiles((prev) => [...prev, ...picked]);
      setOutputUrl(null);
      setError('');
    }
    e.target.value = '';
  };

  const move = (i, dir) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const merge = async () => {
    if (files.length < 2) { setError('Add at least two PDF files to merge.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save({ useObjectStreams: true });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(new Blob([out], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError('Could not merge these files — one of them may be corrupted or password-protected.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = 'merged.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="PDF Merger" description="Combine multiple PDFs into a single document, in the exact order you choose.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Add PDF files</label>
          <input ref={inputRef} className="tool-input" type="file" accept="application/pdf" multiple onChange={addFiles} />
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="file-row">
                <span className="file-index">{i + 1}</span>
                <span className="file-name">{f.name}</span>
                <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label="Move down">↓</button>
                <button className="icon-btn danger" onClick={() => remove(i)} aria-label="Remove">✕</button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={merge} disabled={busy || files.length < 2}>
            {busy ? 'Merging…' : files.length ? `Merge ${files.length} PDFs` : 'Merge PDFs'}
          </button>
          {outputUrl && (
            <button className="tool-btn" onClick={download}>Download merged PDF</button>
          )}
        </div>

        {outputUrl && (
          <div className="output-note">
            Merged document ready — {files.length} files combined in the order shown above.
            <object data={outputUrl} type="application/pdf" className="pdf-preview" aria-label="Merged PDF preview" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfMerger;
