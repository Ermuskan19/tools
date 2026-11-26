import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { formatBytes } from '../shared/text';

const PERMISSIONS = [
  { key: 'printing', label: 'Allow printing', values: ['highResolution', 'none'] },
  { key: 'copying', label: 'Allow copying text', values: [true, false] },
  { key: 'modifying', label: 'Allow editing', values: [true, false] }
];

const ProtectPdf = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [print, setPrint] = useState(true);
  const [copy, setCopy] = useState(false);
  const [modify, setModify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, size }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    if (password.length < 4) {
      setError('Choose a password with at least 4 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // @cantoo/pdf-lib adds real encryption on top of pdf-lib's API.
      const { PDFDocument } = await import('@cantoo/pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
      src.encrypt({
        userPassword: password,
        ownerPassword: ownerPassword || password,
        permissions: {
          printing: print ? 'highResolution' : 'none',
          copying: copy,
          modifying: modify,
          annotating: modify,
          fillingForms: modify,
          contentAccessibility: copy,
          documentAssembly: modify
        }
      });
      const outBytes = await src.save({ useObjectStreams: true });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        size: outBytes.length
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not protect this PDF.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-protected.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Protect PDF" description="Add a real password to your PDF — behavioural encryption, not just a badge.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <label className="tool-label">Password to open the file</label>
          <input
            className="tool-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 4 characters"
          />
          <label className="tool-label">Owner password (optional — lets you change permissions later)</label>
          <input
            className="tool-input"
            type="password"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            placeholder="Defaults to the password above"
          />
          <label className="tool-label">Permissions for people who can open it</label>
          <div className="control-row">
            {PERMISSIONS.map((p) => {
              const checked = p.key === 'printing' ? print : p.key === 'copying' ? copy : modify;
              const setter = p.key === 'printing' ? setPrint : p.key === 'copying' ? setCopy : setModify;
              return (
                <label key={p.key} className="tool-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} />
                  {p.label}
                </label>
              );
            })}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || password.length < 4}>
            {busy ? 'Encrypting…' : 'Protect PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download protected PDF</button>}
        </div>

        {result && (
          <p className="form-note">
            Encrypted with AES-256 ({formatBytes(result.size)}). Open the file with the password you set — this cannot be undone.
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

export default ProtectPdf;
