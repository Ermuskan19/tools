import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { applyTextWatermark } from '../shared/watermark';

const KycWatermark = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [note, setNote] = useState('For KYC use only');
  const [mode, setMode] = useState('diagonal');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setError('Could not read this PDF.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      await applyTextWatermark(src, {
        text: `${note.trim() || 'For KYC use only'} — ${new Date().toLocaleDateString('en-IN')}`,
        size: mode === 'tile' ? 20 : 44,
        opacity: mode === 'tile' ? 0.22 : 0.3,
        angle: mode === 'tile' ? 30 : 38,
        anchor: mode === 'tile' ? 'tile' : 'center',
        color: [0.85, 0.16, 0.2]
      });
      const outBytes = await src.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Watermark failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-kyc.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="KYC Watermark" description="Mark your document copies with a dated KYC watermark before sharing them.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <label className="tool-label">Watermark text</label>
          <input className="tool-input" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For KYC use only" />
          <label className="tool-label">Style</label>
          <select className="tool-input" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="diagonal">Single diagonal stamp</option>
            <option value="tile">Repeated across the page</option>
          </select>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0}>
            {busy ? 'Adding KYC watermark…' : 'Add KYC watermark'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
        <p className="form-note">
          The stamp includes today’s date so a shared copy is easy to trace. Apply it before sending documents to a lender or agent.
        </p>
      </div>
    </ToolLayout>
  );
};

export default KycWatermark;
