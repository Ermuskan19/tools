import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { htmlToPdfBytes } from '../shared/htmlPdf';

const SAMPLE = `<h1>Invoice #1042</h1>
<p>Thanks for your order. This PDF was generated in your browser.</p>
<ul><li>Design work — ₹4,000</li><li>Hosting — ₹1,200</li></ul>
<p><strong>Total:</strong> ₹5,200</p>`;

const HtmlToPdf = () => {
  const [html, setHtml] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, blocks }

  const convert = async () => {
    if (!html.trim()) { setError('Paste some HTML first.'); return; }
    setBusy(true);
    setError('');
    try {
      const bytes = await htmlToPdfBytes(html, { title: 'HTML document' });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })),
        size: bytes.length
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not build a PDF from this HTML.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = 'html-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="HTML to PDF" description="Paste HTML and get a real, downloadable PDF — headings, paragraphs, lists, quotes, tables and inline images.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">HTML</label>
          <textarea
            className="tool-textarea"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<h1>Hello</h1><p>Your HTML here</p>"
            spellCheck={false}
            style={{ minHeight: 220, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !html.trim()}>
            {busy ? 'Rendering…' : 'Convert to PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>

        <p className="form-note">
          Structure is preserved; layout CSS and external images are not (use data: URLs for images). Everything is
          rendered on your device.
        </p>

        {result && (
          <object data={result.url} type="application/pdf" className="pdf-preview" aria-label="PDF preview" />
        )}
      </div>
    </ToolLayout>
  );
};

export default HtmlToPdf;
