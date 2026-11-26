import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';

const PdfToTxt = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setText('');
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfjs = await loadPdfjs();
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: srcBytes.slice() });
      const pdf = await task.promise;

      const parts = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items.filter((it) => it.str);
        const str = items.map((it) => it.str).join(' ');
        parts.push(`\n--- Page ${i} ---\n${str}`);
        page.cleanup();
      }
      await task.destroy();
      setText(parts.join('\n'));
    } catch (err) {
      console.error(err);
      setError('Could not extract text — the PDF may be scanned or corrupted.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(file && file.name.replace(/\.pdf$/i, '')) || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="PDF to TXT" description="Plain text extraction from PDF.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Extracting…' : 'Extract text'}
          </button>
          {text && <button className="tool-btn" onClick={download}>Download .txt</button>}
        </div>

        {text && (
          <div className="text-output">
            <textarea className="tool-textarea" value={text} readOnly spellCheck={false} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToTxt;
