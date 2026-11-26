import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const A4 = [595.28, 841.89];

const ApplicationBundleMaker = () => {
  const [files, setFiles] = useState([]); // { id, file, kind, pages }
  const [normalize, setNormalize] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, pages, items }

  const addFiles = async (e) => {
    const picked = Array.from(e.target.files || []).filter(
      (f) => f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    if (!picked.length) { e.target.value = ''; return; }
    const added = [];
    for (const f of picked) {
      const kind = f.type === 'application/pdf' ? 'pdf' : 'image';
      let pages = 1;
      if (kind === 'pdf') {
        try {
          const { PDFDocument } = await import('pdf-lib');
          const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
          pages = doc.getPageCount();
        } catch {
          setError(`${f.name} could not be read and was skipped.`);
          continue;
        }
      }
      added.push({ id: `f${Date.now()}${Math.random()}`, file: f, kind, pages });
    }
    setFiles((prev) => [...prev, ...added]);
    setResult(null);
    e.target.value = '';
  };

  const remove = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

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
    if (!files.length) { setError('Add the marksheet, ID proof and photo first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const out = await PDFDocument.create();
      let totalPages = 0;

      for (const entry of files) {
        const bytes = new Uint8Array(await entry.file.arrayBuffer());
        if (entry.kind === 'pdf') {
          const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const copied = await out.copyPages(src, src.getPageIndices());
          for (const page of copied) {
            if (normalize) {
              const { width, height } = page.getSize();
              if (Math.abs(width - A4[0]) > 2 || Math.abs(height - A4[1]) > 2) {
                const scale = Math.min(A4[0] / width, A4[1] / height);
                page.scaleContent(scale, scale);
                page.translateContent((A4[0] - width * scale) / 2, (A4[1] - height * scale) / 2);
                page.setSize(A4[0], A4[1]);
              }
            }
            out.addPage(page);
            totalPages += 1;
          }
        } else {
          const image = /png$/i.test(entry.file.type)
            ? await out.embedPng(bytes)
            : /jpe?g$/i.test(entry.file.type)
              ? await out.embedJpg(bytes)
              : null;
          if (!image) throw new Error(`${entry.file.name}: convert WebP/HEIC photos to JPG first.`);
          const [w, h] = normalize ? A4 : [image.width, image.height];
          const page = out.addPage([w, h]);
          const margin = normalize ? 36 : 0;
          const scale = Math.min((w - margin * 2) / image.width, (h - margin * 2) / image.height);
          const dw = image.width * scale;
          const dh = image.height * scale;
          page.drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
          totalPages += 1;
        }
      }

      out.setTitle('Application bundle');
      out.setProducer('3toOne');
      out.setCreator('3toOne');
      const outBytes = await out.save({ useObjectStreams: true });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        pages: totalPages,
        items: files.length
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not build the bundle.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = 'application-bundle.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Application Bundle Maker" description="Combine a marksheet, ID proof and photo — PDFs or images — into one ordered bundle.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Documents (PDF or JPG/PNG, multiple allowed)</label>
          <input className="tool-input" type="file" accept="application/pdf,image/png,image/jpeg" multiple onChange={addFiles} />
          <label className="tool-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} />
            Fit every page to A4 (recommended for portals)
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, i) => (
              <div key={f.id} className="file-row">
                <span className="file-index">{i + 1}</span>
                <span className="file-name">{f.file.name}</span>
                <span className="file-size">{f.kind === 'pdf' ? `${f.pages} page${f.pages > 1 ? 's' : ''}` : 'image'}</span>
                <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label="Move down">↓</button>
                <button className="icon-btn danger" onClick={() => remove(f.id)} aria-label="Remove">✕</button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !files.length}>
            {busy ? 'Bundling…' : 'Create bundle'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download bundle</button>}
        </div>

        {result && (
          <p className="form-note">
            {result.items} item{result.items > 1 ? 's' : ''} · {result.pages} page{result.pages > 1 ? 's' : ''} in one PDF,
            in the order shown above.
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

export default ApplicationBundleMaker;
