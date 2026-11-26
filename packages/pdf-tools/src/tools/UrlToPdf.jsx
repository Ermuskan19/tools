import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { htmlToPdfBytes } from '../shared/htmlPdf';

const normalizeUrl = (value) => {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const UrlToPdf = () => {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState(null); // { url, title }

  const convert = async () => {
    const target = normalizeUrl(url);
    if (!target) { setError('Enter a URL.'); return; }
    setBusy(true);
    setError('');
    setBlocked(false);
    setResult(null);
    try {
      const res = await fetch(target, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`The page returned HTTP ${res.status}.`);
      const type = res.headers.get('content-type') || '';
      if (!/html|text\/plain/i.test(type)) throw new Error('That URL is not an HTML page.');
      const html = await res.text();
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || target;
      const bytes = await htmlToPdfBytes(html, { title, baseUrl: target });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })),
        title
      });
    } catch (err) {
      setBlocked(true);
      setError(
        `This site blocked direct reading (${err.message}). Sites without CORS headers can only be saved through the browser's own print dialog.`
      );
    } finally {
      setBusy(false);
    }
  };

  const openAndPrint = () => {
    const target = normalizeUrl(url);
    if (!target) return;
    const win = window.open(target, '_blank', 'noopener');
    if (!win) { setError('Popup blocked — allow popups for this site, then try again.'); return; }
    setTimeout(() => { try { win.print(); } catch { /* user can print manually */ } }, 1200);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${(result.title || 'web-page').replace(/[^\w\- ]+/g, '').trim().slice(0, 60) || 'web-page'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="URL to PDF" description="Save a readable web page as a PDF. Pages that allow reading are converted here; the rest open in print view.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Web page URL</label>
          <div className="url-row">
            <input
              className="tool-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              onKeyDown={(e) => { if (e.key === 'Enter') convert(); }}
            />
            <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !url.trim()}>
              {busy ? 'Reading page…' : 'Convert to PDF'}
            </button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {(error || blocked) && url.trim() && (
          <div className="tool-actions">
            <button className="tool-btn" onClick={openAndPrint}>Open page &amp; print to PDF</button>
          </div>
        )}

        {result && <button className="tool-btn" onClick={download}>Download PDF</button>}

        {result && (
          <>
            <p className="form-note">Saved “{result.title}”. Text and structure are kept; site styling is not.</p>
            <object data={result.url} type="application/pdf" className="pdf-preview" aria-label="Saved page preview" />
          </>
        )}

        <p className="form-note">
          Browsers can only read pages from sites that allow cross-origin requests. When a site blocks that, use
          “Open page &amp; print to PDF”.
        </p>
      </div>
    </ToolLayout>
  );
};

export default UrlToPdf;
