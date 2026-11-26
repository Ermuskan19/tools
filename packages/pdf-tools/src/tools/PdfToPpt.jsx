import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { extractPageTexts } from '../shared/pdfjs';
import { textPagesToPptx } from '../shared/pptx';
import { saveBlob, baseName } from '../shared/download';

const PdfToPpt = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { slides, words }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pageTexts = await extractPageTexts(file);
      const slides = pageTexts.map((text) => text.split('\n').map((l) => l.trim()).filter(Boolean));
      const words = pageTexts.join(' ').split(/\s+/).filter(Boolean).length;
      if (!words) {
        setError('No selectable text found. Scanned PDFs need OCR before they can become slides.');
        return;
      }
      const blob = await textPagesToPptx(slides, { title: baseName(file.name, 'pdf') });
      saveBlob(blob, `${baseName(file.name, 'pdf')}.pptx`);
      setResult({ slides: slides.length, words });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not build the presentation.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout title="PDF to PPT" description="Turn each PDF page into an editable PowerPoint slide — a real .pptx, not a print-out.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Building slides…' : 'Convert to PPTX'}
          </button>
        </div>

        {result && (
          <p className="form-note">
            Downloaded {result.slides} slide{result.slides > 1 ? 's' : ''} with {result.words.toLocaleString()} words.
            Text from each page is placed as editable slide text; images and exact layout are not carried over.
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToPpt;
