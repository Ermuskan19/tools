import { useRef, useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const A4 = [595.28, 841.89];

const ScanToPdf = () => {
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]); // { id, src, name }
  const [pageSize, setPageSize] = useState('a4');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError('Camera access is unavailable. Upload photos of the pages instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPhotos((prev) => [
      ...prev,
      { id: `p${Date.now()}`, src: canvas.toDataURL('image/jpeg', 0.92), name: `scan-${prev.length + 1}.jpg` }
    ]);
    setResultUrl(null);
  };

  const addUploads = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    files.forEach(async (f) => {
      let src;
      if (/^image\/(png|jpe?g)$/i.test(f.type)) {
        src = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(f);
        });
      } else {
        // Normalise WebP/AVIF photos so they can be embedded in the PDF.
        const bitmap = await createImageBitmap(f);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        src = canvas.toDataURL('image/jpeg', 0.92);
        bitmap.close?.();
      }
      setPhotos((prev) => [...prev, { id: `p${Date.now()}${Math.random()}`, src, name: f.name }]);
    });
    setResultUrl(null);
    e.target.value = '';
  };

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i, dir) => {
    setPhotos((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const convert = async () => {
    if (photos.length < 1) { setError('Capture or upload at least one page.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.create();

      for (const photo of photos) {
        const isPng = /^data:image\/png/i.test(photo.src);
        const bytes = Uint8Array.from(atob(photo.src.split(',')[1]), (c) => c.charCodeAt(0));
        const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        if (pageSize === 'auto') {
          const page = doc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          const portrait = image.height >= image.width;
          const [w, h] = portrait ? A4 : [A4[1], A4[0]];
          const page = doc.addPage([w, h]);
          const margin = 18;
          const scale = Math.min((w - margin * 2) / image.width, (h - margin * 2) / image.height);
          const dw = image.width * scale;
          const dh = image.height * scale;
          page.drawImage(image, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
        }
      }

      doc.setProducer('3toOne');
      doc.setCreator('3toOne');
      const outBytes = await doc.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not build the scanned PDF.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'scanned.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Scan to PDF" description="Photograph pages with your camera — or upload photos — and turn them into one PDF.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="scan-area">
            <div className="scan-video">
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto', background: '#000', borderRadius: 12 }} />
              <div className="scan-controls">
                {stream ? (
                  <>
                    <button className="tool-btn tool-btn-primary" onClick={capture}>Capture page</button>
                    <button className="tool-btn" onClick={stopCamera}>Stop camera</button>
                  </>
                ) : (
                  <button className="tool-btn tool-btn-primary" onClick={startCamera}>Start camera</button>
                )}
              </div>
            </div>
          </div>

          <label className="tool-label">Or upload photos of the pages</label>
          <input className="tool-input" type="file" accept="image/*" multiple onChange={addUploads} />

          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Page size</label>
              <select className="tool-input" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="a4">Fit each photo to A4</option>
                <option value="auto">Page = photo size</option>
              </select>
            </div>
          </div>
        </div>

        {photos.length > 0 && (
          <>
            <p className="form-note">{photos.length} page{photos.length > 1 ? 's' : ''} ready — reorder them if needed.</p>
            <div className="image-preview-grid">
              {photos.map((p, i) => (
                <div key={p.id} className="preview-card">
                  <img src={p.src} alt={`Page ${i + 1}`} />
                  <div className="preview-label">Page {i + 1}</div>
                  <div className="control-row" style={{ marginTop: 8, justifyContent: 'center' }}>
                    <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move down">↓</button>
                    <button className="icon-btn danger" onClick={() => removePhoto(i)} aria-label="Remove">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || photos.length < 1}>
            {busy ? 'Building PDF…' : 'Create PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </ToolLayout>
  );
};

export default ScanToPdf;
