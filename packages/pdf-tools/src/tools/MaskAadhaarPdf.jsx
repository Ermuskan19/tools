import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { renderPdfPages, loadPdfjs } from '../shared/pdfjs';
import { PageAreaEditor, pdfRectToDisplay } from '../shared/PageAreaEditor';
import { saveBytes, baseName } from '../shared/download';
import { buildRedactedPdf } from '../shared/raster';

const MaskAadhaarPdf = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [keepLast, setKeepLast] = useState(true);

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

  const autoDetect = async () => {
    if (!file || !pages.length) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const pdfjs = await loadPdfjs();
      const data = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: data.slice() });
  const pdf = await task.promise;
      const found = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const info = pages.find((p) => p.index === i);
        if (!info) continue;
        const content = await page.getTextContent();
        for (const item of content.items) {
          const str = item.str || '';
          const re = /\d{4}[\s-]?\d{4}[\s-]?\d{4}|\d{8,}/g;
          let m;
          while ((m = re.exec(str)) !== null) {
            const full = m[0];
            const digits = full.replace(/\D/g, '');
            if (digits.length < 8) continue;
            const keep = keepLast ? digits.slice(-4) : '';
            const maskChars = digits.length - keep.length;
            const startIdx = m.index;
            // Approximate per-character width from the whole item.
            const itemWidth = item.width || 0;
            const charW = str.length ? itemWidth / str.length : 0;
            const x = (item.transform?.[4] || 0) + startIdx * charW;
            const y = item.transform?.[5] || 0;
            const h = item.height || Math.abs(item.transform?.[3] || 0) || 10;
            const w = maskChars * charW;
            if (w <= 0) continue;
            const display = pdfRectToDisplay(info, { x, y: y - h * 0.15, width: w, height: h });
            found.push({
              id: `a${found.length}${Math.random().toString(36).slice(2, 6)}`,
              page: i,
              ...display
            });
          }
        }
        page.cleanup();
      }
      await task.destroy();
      if (!found.length) {
        setNote(
          'No Aadhaar-style number found in the text layer. This PDF may be scanned — draw boxes manually over the digits instead.'
        );
      } else {
        setBoxes(found);
        setNote(`Found ${found.length} number${found.length > 1 ? 's' : ''} — ${keepLast ? 'last 4 digits kept,' : 'fully masked,'} review and adjust before downloading.`);
      }
    } catch {
      setError('Auto-detect failed — please draw the mask boxes manually.');
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!file || !pages.length) return;
    if (!boxes.length) {
      setError('Draw at least one mask box first (or use Auto-detect).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // Masked pages are flattened to images so the digits cannot be recovered
      // from the hidden text layer; untouched pages keep their text.
      const out = await buildRedactedPdf(file, boxes, { scale: 2 });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(new Blob([out], { type: 'application/pdf' }));
      setResultUrl(url);
      saveBytes(out, `${baseName(file.name, 'pdf')}-masked.pdf`);
    } catch (err) {
      setError(err.message || 'Masking failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout title="Mask Aadhaar PDF" description="Hide Aadhaar digits before sharing — masked pages are flattened so the number cannot be recovered.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Aadhaar PDF</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {loading && <p className="form-note">Rendering pages…</p>}

        {pages.length > 0 && (
          <>
            <div className="control-row">
              <label className="tool-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={keepLast}
                  onChange={(e) => setKeepLast(e.target.checked)}
                />
                Keep last 4 digits visible
              </label>
              <button className="tool-btn" onClick={autoDetect} disabled={busy}>
                {busy ? 'Scanning…' : 'Auto-detect number'}
              </button>
            </div>

            <PageAreaEditor
              pages={pages}
              boxes={boxes}
              onChange={setBoxes}
              color="#111827"
              hint="Drag across the Aadhaar number to draw a black bar. Drag to move, corner to resize, × to delete."
            />
          </>
        )}

        {note && <p className="form-note">{note}</p>}
        <p className="form-note">
          Pages you mask are converted to images before the bars are drawn, so the hidden digits are removed from the text
          layer too. Unmasked pages keep their selectable text.
        </p>
        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button
            className="tool-btn tool-btn-primary"
            onClick={apply}
            disabled={busy || loading || !file || !pages.length}
          >
            {busy ? 'Masking…' : 'Mask digits & download'}
          </button>
          {resultUrl && (
            <button className="tool-btn" onClick={() => window.open(resultUrl)}>
              Preview
            </button>
          )}
        </div>

        {resultUrl && (
          <object data={resultUrl} type="application/pdf" className="pdf-preview" aria-label="Masked PDF preview" />
        )}
      </div>
    </ToolLayout>
  );
};

export default MaskAadhaarPdf;
