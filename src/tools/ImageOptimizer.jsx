import { useState, useRef, useEffect, useCallback } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const ImageOptimizer = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [quality, setQuality] = useState(0.85);
  const [format, setFormat] = useState('image/jpeg');
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(0);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const resultUrlRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultSize(0);
    setResultUrl(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady((n) => n + 1);
    };
    img.src = url;
  };

  const optimize = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setProcessing(true);
    const ctx = canvas.getContext('2d');

    let width = img.width;
    let height = img.height;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setProcessing(false);
          return;
        }
        if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        const url = URL.createObjectURL(blob);
        resultUrlRef.current = url;
        setResultUrl(url);
        setResultSize(blob.size);
        setProcessing(false);
      },
      format,
      quality
    );
  }, [maxWidth, quality, format]);

  // Re-run whenever the image loads or a setting changes (avoids stale state).
  useEffect(() => {
    if (ready > 0) optimize();
  }, [ready, optimize]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `optimized.${format.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pctSaved = originalSize && resultSize ? Math.round(((originalSize - resultSize) / originalSize) * 100) : 0;

  return (
    <ToolLayout title="Image Optimizer" description="Compress and resize images without losing visual quality.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Image</label>
          <input className="tool-input" type="file" accept="image/*" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Max width (px)</label>
              <input className="tool-input" type="number" min="100" value={maxWidth} onChange={(e) => setMaxWidth(Math.max(100, Number(e.target.value) || 100))} />
            </div>
            <div className="control-group">
              <label className="tool-label">Quality</label>
              <input className="tool-input" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label className="tool-label">Format</label>
              <select className="tool-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </div>
          </div>
        </div>

        <div className="image-preview">
          {file ? (
            <>
              <div className="preview-card original">
                <img src={previewUrl} alt="Original" />
                <div className="preview-label">Original ({(originalSize / 1024).toFixed(1)} KB)</div>
              </div>
              {resultUrl && (
                <div className="preview-card result">
                  <img src={resultUrl} alt="Optimized" />
                  <div className="preview-label">Optimized ({(resultSize / 1024).toFixed(1)} KB · {pctSaved}% smaller)</div>
                </div>
              )}
            </>
          ) : (
            <div className="drop-zone">Click to upload an image (JPEG, PNG, WebP)</div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />

        {resultUrl && (
          <div className="tool-actions">
            <button className="tool-btn tool-btn-primary" onClick={download} disabled={processing}>
              {processing ? 'Processing...' : 'Download optimized image'}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageOptimizer;
