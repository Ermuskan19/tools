import { useState, useRef } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const BackgroundRemover = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl(null);
    setError('');
    e.target.value = '';
  };

  const remove = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setProgress('Loading the AI model (one-time download)…');
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          const pct = total ? Math.round((current / total) * 100) : 0;
          const label = key.split('/').pop() || key;
          setProgress(`${label}: ${pct}%`);
        }
      });
      if (resultRef.current) URL.revokeObjectURL(resultRef.current);
      const url = URL.createObjectURL(blob);
      resultRef.current = url;
      setResultUrl(url);
      setProgress('');
    } catch (err) {
      console.error(err);
      setError('Background removal failed — try a smaller image (under about 2000px).');
      setProgress('');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'no-background.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Background Remover" description="Remove image backgrounds automatically with an AI model that runs in your browser.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Photo</label>
          <input className="tool-input" type="file" accept="image/*" onChange={handleFile} />
          <p className="form-note">First use downloads the AI model once (~40 MB); after that it runs fully offline on your device.</p>
        </div>

        <div className="image-preview">
          {file && (
            <>
              <div className="preview-card original">
                <img src={previewUrl} alt="Original" />
                <div className="preview-label">Original ({(file.size / 1024).toFixed(0)} KB)</div>
              </div>
              {resultUrl && (
                <div className="preview-card result checker">
                  <img src={resultUrl} alt="Background removed" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div className="preview-label">Transparent PNG</div>
                </div>
              )}
            </>
          )}
        </div>

        {progress && <p className="form-note">{progress}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={remove} disabled={busy || !file}>
            {busy ? 'Processing…' : 'Remove background'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PNG</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default BackgroundRemover;
