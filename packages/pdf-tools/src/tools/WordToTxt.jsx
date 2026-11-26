import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const WordToTxt = () => {
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
      const mammoth = (await import('mammoth')).default;
      const { value } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      const root = new DOMParser().parseFromString(value, 'text/html');
      // Turn block boundaries into real line breaks before flattening.
      root.body.querySelectorAll('p, div, br, li, h1, h2, h3, h4, h5, h6, tr').forEach((el) => {
        if (el.tagName === 'BR') el.replaceWith('\n');
        else el.append('\n');
      });
      const plain = (root.body.textContent || '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
      setText(plain);
    } catch (err) {
      console.error(err);
      setError('Could not read this Word file.');
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
    a.download = `${(file && file.name.replace(/\.docx$/i, '')) || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Word to TXT" description="Strip formatting fast — Word to plain text.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Word document (.docx)</label>
          <input className="tool-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} />
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

export default WordToTxt;
