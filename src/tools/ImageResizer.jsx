import { useState, useRef, useEffect, useCallback } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const ImageResizer = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState(100);
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(0.92);
  const [natural, setNatural] = useState(null); // { w, h } of the original
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(0);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const ratioRef = useRef(1);
  const resultUrlRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultUrl(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      ratioRef.current = img.width / img.height;
      setNatural({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
      setPercent(100);
      setReady((n) => n + 1);
    };
    img.src = url;
  };

  const onWidth = (w) => {
    setWidth(w);
    if (lock && ratioRef.current) setHeight(Math.max(1, Math.round(w / ratioRef.current)));
  };
  const onHeight = (h) => {
    setHeight(h);
    if (lock && ratioRef.current) setWidth(Math.max(1, Math.round(h * ratioRef.current)));
  };
  const onPercent = (p) => {
    setPercent(p);
    const img = imgRef.current;
    if (!img) return;
    setWidth(Math.max(1, Math.round((img.width * p) / 100)));
    setHeight(Math.max(1, Math.round((img.height * p) / 100)));
  };

  const resize = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || width < 1 || height < 1) return;
    setProcessing(true);
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob) { setProcessing(false); return; }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
      setProcessing(false);
    }, format, quality);
  }, [width, height, format, quality]);

  useEffect(() => {
    if (ready > 0) resize();
  }, [ready, resize]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `resized-${width}x${height}.${format.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pctSaved = originalSize && resultSize && resultSize < originalSize
    ? Math.round(((originalSize - resultSize) / originalSize) * 100)
    : 0;

  return (
    <ToolLayout title="Image Resizer" description="Resize images to exact pixel dimensions or by percentage, with aspect-ratio lock.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Image</label>
          <input className="tool-input" type="file" accept="image/*" onChange={handleFile} />
          {file && (
            <div className="control-row">
              <div className="control-group">
                <label className="tool-label">Width (px)</label>
                <input className="tool-input" type="number" min="1" value={width} onChange={(e) => onWidth(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="control-group">
                <label className="tool-label">Height (px)</label>
                <input className="tool-input" type="number" min="1" value={height} onChange={(e) => onHeight(Math.max(1, Number(e.target.value) || 1))} />
              </div>
              <div className="control-group">
                <label className="tool-label">Scale (%)</label>
                <input className="tool-input" type="number" min="1" max="500" value={percent} onChange={(e) => onPercent(Math.min(500, Math.max(1, Number(e.target.value) || 1)))} />
              </div>
              <div className="control-group">
                <label className="tool-label">Format</label>
                <select className="tool-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              {format !== 'image/png' && (
                <div className="control-group">
                  <label className="tool-label">Quality</label>
                  <input className="tool-input" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
                  <span className="control-value">{Math.round(quality * 100)}%</span>
                </div>
              )}
            </div>
          )}
          {file && (
            <label className="check-row">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
              Lock aspect ratio {natural ? `(${natural.w}×${natural.h} original)` : ''}
            </label>
          )}
        </div>

        <div className="image-preview">
          {file ? (
            <>
              <div className="preview-card original">
                <img src={previewUrl} alt="Original" />
                <div className="preview-label">Original ({natural ? `${natural.w}×${natural.h}` : ''} · {(originalSize / 1024).toFixed(1)} KB)</div>
              </div>
              {resultUrl && (
                <div className="preview-card result">
                  <img src={resultUrl} alt="Resized" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div className="preview-label">Resized ({width}×{height} · {(resultSize / 1024).toFixed(1)} KB{pctSaved > 0 ? ` · ${pctSaved}% smaller` : ''})</div>
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
              {processing ? 'Resizing…' : 'Download resized image'}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageResizer;
