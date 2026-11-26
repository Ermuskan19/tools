import { useState, useRef, useEffect, useCallback } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const ImageConverter = ({ defaultFormat = 'image/png', title = 'Image Converter', description = 'Convert images between PNG, JPEG, and WebP with quality control.' }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(0.9);
  const [format, setFormat] = useState(defaultFormat);
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

  const convert = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setProcessing(true);
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

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
  }, [format, quality]);

  // Re-run whenever the image loads or a setting changes (avoids stale state).
  useEffect(() => {
    if (ready > 0) convert();
  }, [ready, convert]);

  const download = () => {
    if (!resultUrl) return;
    const ext = format.split('/')[1];
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title={title} description={description}>
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Image</label>
          <input className="tool-input" type="file" accept="image/*" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Format</label>
              <select className="tool-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Quality</label>
              <input className="tool-input" type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
              <span className="control-value">{Math.round(quality * 100)}%</span>
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
                  <img src={resultUrl} alt="Converted" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div className="preview-label">Converted ({(resultSize / 1024).toFixed(1)} KB)</div>
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
              {processing ? 'Converting...' : 'Download converted image'}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageConverter;
