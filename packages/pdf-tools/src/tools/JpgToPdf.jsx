import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const A4 = [595.28, 841.89];

const JpgToPdf = () => {
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState('auto');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (picked.length) {
      setFiles((prev) => [...prev, ...picked]);
      setError('');
    }
    e.target.value = '';
  };

  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i, dir) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const convert = async () => {
    if (files.length < 1) { setError('Add at least one image.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.create();

      for (const file of files) {
        let bytes = new Uint8Array(await file.arrayBuffer());
        let mime = file.type;

        // Browsers can display WebP/AVIF but pdf-lib only embeds PNG/JPEG, so
        // re-encode anything else through a canvas first.
        if (!/^image\/(png|jpe?g)$/i.test(mime)) {
          const bitmap = await createImageBitmap(new Blob([bytes], { type: mime || 'image/*' }));
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          canvas.getContext('2d').drawImage(bitmap, 0, 0);
          bytes = Uint8Array.from(atob(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]), (c) => c.charCodeAt(0));
          mime = 'image/jpeg';
          bitmap.close?.();
          canvas.width = 0;
          canvas.height = 0;
        }

        const image = mime === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        if (pageSize === 'a4') {
          const portrait = image.height >= image.width;
          const [w, h] = portrait ? A4 : [A4[1], A4[0]];
          const page = pdf.addPage([w, h]);
          const margin = 18;
          const scale = Math.min((w - margin * 2) / image.width, (h - margin * 2) / image.height);
          const dw = image.width * scale;
          const dh = image.height * scale;
          page.drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
        } else {
          const page = pdf.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }

      const outBytes = await pdf.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError('Could not convert images to PDF.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'converted.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="JPG to PDF" description="Order, resize, set target KB — images to PDF.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Image files (JPG, PNG, WebP)</label>
          <input ref={null} className="tool-input" type="file" accept="image/*" multiple onChange={addFiles} />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Page size</label>
              <select className="tool-input" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="auto">Page = image size</option>
                <option value="a4">Fit each image to A4</option>
              </select>
            </div>
          </div>
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
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || files.length < 1}>
            {busy ? 'Converting…' : 'Convert to PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JpgToPdf;
