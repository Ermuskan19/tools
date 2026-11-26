import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { readPptx, slidesToPdfBytes } from '../shared/pptx';
import { baseName } from '../shared/download';

const PptToPdf = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, slides, words }

  const handleFile = (e) => {
    const f = e.target.files[0] || null;
    setResult(null);
    setError('');
    if (f && !/\.pptx$/i.test(f.name)) {
      setError('Upload a .pptx presentation. Old .ppt files need to be saved as .pptx first.');
      setFile(null);
    } else {
      setFile(f);
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const slides = await readPptx(file);
      if (!slides.length) {
        setError('No slides found — this file does not look like a valid .pptx.');
        return;
      }
      const words = slides.reduce(
        (n, s) => n + s.paragraphs.join(' ').split(/\s+/).filter(Boolean).length, 0
      );
      if (!words) {
        setError('This deck has no text (it may be all images). Nothing readable to lay out.');
        return;
      }
      const bytes = await slidesToPdfBytes(slides, {
        title: baseName(file.name, 'pptx'),
        sourceName: file.name
      });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })),
        slides: slides.length,
        words
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not convert this presentation.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${baseName(file.name, 'pptx')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="PPT to PDF" description="Read a .pptx deck in your browser and turn every slide into a PDF handout page.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PowerPoint file (.pptx)</label>
          <input
            className="tool-input"
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFile}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Converting…' : 'Convert to PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>

        {result && (
          <>
            <p className="form-note">
              {result.slides} slide{result.slides > 1 ? 's' : ''} · {result.words.toLocaleString()} words laid out as
              landscape handout pages.
            </p>
            <object data={result.url} type="application/pdf" className="pdf-preview" aria-label="PDF preview" />
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default PptToPdf;
