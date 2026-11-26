import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const CANVAS_ID = 'qr-scanner-canvas';

const decodeImage = (source, width, height) => {
  const canvas = document.getElementById(CANVAS_ID);
  if (!canvas) return null;
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
};

export const QrScanner = () => {
  const [mode, setMode] = useState('upload');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [fileName, setFileName] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const lastScanRef = useRef(0);

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  useEffect(() => () => stopCamera(), []);

  const scanFile = async (file) => {
    if (!file) return;
    setError('');
    setResult('');
    setFileName(file.name);
    try {
      const bitmap = await createImageBitmap(file);
      const found = decodeImage(bitmap, bitmap.width, bitmap.height);
      bitmap.close?.();
      if (found?.data) setResult(found.data);
      else setError('No QR code found in that image. Try a clearer, closer photo.');
    } catch {
      setError('Could not read that image. Use a PNG, JPG or WebP file.');
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      const now = performance.now();
      if (now - lastScanRef.current > 220) {
        lastScanRef.current = now;
        const found = decodeImage(video, video.videoWidth, video.videoHeight);
        if (found?.data) {
          setResult(found.data);
          stopCamera();
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setError('');
    setResult('');
    setMode('camera');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available in this browser. Upload a photo instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraOn(true);
        lastScanRef.current = 0;
        rafRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (e) {
      setError(e?.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow access or upload an image instead.'
        : 'Could not start the camera. Upload an image instead.');
      setCameraOn(false);
    }
  };

  const isUrl = /^https?:\/\//i.test(result);
  const copy = async () => {
    try { await navigator.clipboard.writeText(result); } catch { setError('Could not copy the result.'); }
  };

  return (
    <section className="calculator">
      <canvas id={CANVAS_ID} style={{ display: 'none' }} />
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Scan a QR code</h2><span className="live-pill">Private</span></div>
          <div className="segment" style={{ marginBottom: 16 }}>
            <button type="button" className={`seg-btn ${mode === 'upload' ? 'on' : ''}`} onClick={() => { stopCamera(); setMode('upload'); }}>Upload image</button>
            <button type="button" className={`seg-btn ${mode === 'camera' ? 'on' : ''}`} onClick={startCamera}>Use camera</button>
          </div>

          {mode === 'upload' ? (
            <div className="cal-field">
              <label className="field-label">QR image</label>
              <div className="number-box wide" style={{ padding: 10 }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => scanFile(e.target.files?.[0])}
                  style={{ width: '100%' }}
                />
              </div>
              {fileName && <p className="panel-note">Reading {fileName}</p>}
            </div>
          ) : (
            <div className="cal-field">
              <label className="field-label">Camera preview</label>
              <div style={{ background: '#0f172a', borderRadius: 14, overflow: 'hidden', aspectRatio: '4 / 3', display: 'grid', placeItems: 'center' }}>
                <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="panel-note">{cameraOn ? 'Hold the QR code inside the frame.' : 'Starting camera…'}</p>
              {cameraOn && <button type="button" className="btn" onClick={stopCamera}>Stop camera</button>}
            </div>
          )}

          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
          <p className="panel-note">Images and camera frames are decoded on this device. Nothing is uploaded.</p>
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          {result ? (
            <>
              <div className="result-label">QR content</div>
              <div className="result-big" style={{ fontSize: 20, wordBreak: 'break-word', lineHeight: 1.4 }}>{result}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                <button type="button" className="btn solid" onClick={copy}>Copy</button>
                {isUrl && (
                  <a className="btn" href={result} target="_blank" rel="noopener noreferrer nofollow">Open link</a>
                )}
              </div>
              <p className="panel-note">Check the destination before opening links you do not recognise.</p>
            </>
          ) : (
            <div className="empty-panel">Upload a QR image or use your camera to see the decoded content here.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QrScanner;
