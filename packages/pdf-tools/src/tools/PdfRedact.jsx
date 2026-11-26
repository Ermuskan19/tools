import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { renderPdfPages, loadPdfjs } from '../shared/pdfjs';
import { PageAreaEditor, pdfRectToDisplay } from '../shared/PageAreaEditor';
import { saveBytes, baseName } from '../shared/download';
import { buildRedactedPdf } from '../shared/raster';

const PdfRedact = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPages([]);
    setBoxes([]);
    setResultUrl(null);
    setError('');
    setNote('');
    setLoading(true);
    try {
      const rendered = await renderPdfPages(f);
      setPages(rendered);
    } catch {
      setError('Could not read this PDF — it may be corrupted or password-protected.');
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  };

  const scanCoveredText = async () => {
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await file.arrayBuffer());
    const task = pdfjs.getDocument({ data: data.slice() });
  const pdf = await task.promise;
    let removed = 0;
    for (const box of boxes) {
      const info = pages.find((p) => p.index === box.page);
      const target = await pdf.getPage(box.page);
      if (!info || !target) continue;
      const content = await target.getTextContent();
      for (const item of content.items) {
        if (!item.str || !item.str.trim()) continue;
        const h = item.height || Math.abs(item.transform?.[3] || 0) || 10;
        const d = pdfRectToDisplay(info, {
          x: item.transform[4],
          y: item.transform[5] - h * 0.15,
          width: item.width || 0,
          height: h
        });
        const overlapX = Math.min(box.x + box.w, d.x + d.w) - Math.max(box.x, d.x);
        const overlapY = Math.min(box.y + box.h, d.y + d.h) - Math.max(box.y, d.y);
        if (overlapX > 0 && overlapY > 0) removed += 1;
      }
      await target.cleanup();
    }
    await task.destroy();
    return removed;
  };

  const apply = async () => {
    if (!file || !pages.length) return;
    if (!boxes.length) {
      setError('Draw at least one redaction box first.');
      return;
    }
    setBusy(true);
    setError('');
    setNote('');
    try {
      let removed = 0;
      try {
        removed = await scanCoveredText();
      } catch {
        removed = 0;
      }
      // Burn the boxes into the page pixels: text under a painted rectangle is
      // still extractable, so redacted pages are flattened to images.
      const out = await buildRedactedPdf(file, boxes, { scale: 2 });
      setNote(
        removed
          ? `${removed} text fragment${removed > 1 ? 's' : ''} covered — redacted pages were flattened, so the content is gone from the file.`
          : 'Redacted pages were flattened to images, so nothing under the bars can be extracted.'
      );
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(new Blob([out], { type: 'application/pdf' }));
      setResultUrl(url);
      saveBytes(out, `${baseName(file.name, 'pdf')}-redacted.pdf`);
    } catch (err) {
      setError(err.message || 'Redaction failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout title="PDF Redact" description="Permanently cover sensitive text with solid black boxes.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {loading && <p className="form-note">Rendering pages…</p>}

        {pages.length > 0 && (
          <PageAreaEditor
            pages={pages}
            boxes={boxes}
            onChange={setBoxes}
            color="#111827"
            hint="Drag on a page to draw a redaction box over the text you want to hide."
          />
        )}

        {note && <p className="form-note">{note}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button
            className="tool-btn tool-btn-primary"
            onClick={apply}
            disabled={busy || loading || !file || !pages.length}
          >
            {busy ? 'Redacting…' : 'Apply redaction & download'}
          </button>
          {resultUrl && (
            <button className="tool-btn" onClick={() => window.open(resultUrl)}>
              Preview
            </button>
          )}
        </div>

        {resultUrl && (
          <object data={resultUrl} type="application/pdf" className="pdf-preview" aria-label="Redacted PDF preview" />
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfRedact;
