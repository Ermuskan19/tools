import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const UnlockPdf = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResultUrl(null);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('@cantoo/pdf-lib');
      const bytes = new Uint8Array(await file.arrayBuffer());
      let src;
      try {
        src = await PDFDocument.load(bytes, { password });
      } catch (err) {
        if (/password/i.test(err.message || '')) {
          throw new Error('That password did not open the file. Check it and try again.');
        }
        throw err;
      }
      // A document opened with the password is copied into a fresh file, which
      // drops the encryption dictionary entirely.
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
      out.setProducer('3toOne');
      out.setCreator('3toOne');
      const outBytes = await out.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not unlock this PDF.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-unlocked.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Unlock PDF" description="Remove a password you already know and save a clean copy.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <label className="tool-label">Known password (leave empty if the file only restricts permissions)</label>
          <input
            className="tool-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password used to open the file"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Unlocking…' : 'Unlock PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download unlocked PDF</button>}
        </div>

        {resultUrl && (
          <p className="form-note">Clean copy ready — the new file opens without a password prompt.</p>
        )}
        <p className="form-note">
          Only works with a password you know. The tool decrypts locally; nothing is uploaded.
        </p>
      </div>
    </ToolLayout>
  );
};

export default UnlockPdf;
