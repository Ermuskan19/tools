import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { downloadZip } from '../shared/zip';
import { saveBlob } from '../shared/download';

const KINDS = { 1: 'GRAYSCALE_1BPP', 2: 'RGB_24BPP', 3: 'RGBA_32BPP' };

/** Draw a decoded pdf.js image object onto a canvas and export PNG pixels. */
const imageObjectToBlob = (img) => {
  const { width, height, kind, data, bitmap } = img;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (bitmap) {
    // pdf.js v5+ hands back a decoded ImageBitmap instead of raw pixels.
    ctx.drawImage(bitmap, 0, 0);
  } else if (data) {
    const out = ctx.createImageData(width, height);
    const dest = out.data;
    if (kind === 3 || data.length === width * height * 4) {
      dest.set(data.subarray(0, dest.length));
    } else if (kind === 1 || data.length === width * height) {
      for (let i = 0, j = 0; i < dest.length; i += 4, j++) {
        const v = data[j];
        dest[i] = v; dest[i + 1] = v; dest[i + 2] = v; dest[i + 3] = 255;
      }
    } else {
      for (let i = 0, j = 0; i < dest.length; i += 4, j += 3) {
        dest[i] = data[j]; dest[i + 1] = data[j + 1]; dest[i + 2] = data[j + 2]; dest[i + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
  } else {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
};

const ExtractImages = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]); // { url, blob, name, width, height }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: bytes.slice() });
      const pdf = await task.promise;
      const found = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const ops = await page.getOperatorList();
        // Rendering guarantees the image objects are decoded and available.
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
        canvas.width = 0;
        canvas.height = 0;

        const seen = new Set();
        for (let i = 0; i < ops.fnArray.length; i++) {
          if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
          const name = ops.argsArray[i]?.[0];
          if (!name || seen.has(name)) continue;
          seen.add(name);
          try {
            const img = await new Promise((resolve, reject) => {
              const timer = setTimeout(() => reject(new Error('image timeout')), 4000);
              try {
                const immediate = page.objs.get(name);
                if (immediate) {
                  clearTimeout(timer);
                  resolve(immediate);
                  return;
                }
              } catch {
                /* not resolved yet */
              }
              try {
                page.objs.get(name, (obj) => {
                  clearTimeout(timer);
                  resolve(obj);
                });
              } catch (err) {
                clearTimeout(timer);
                reject(err);
              }
            });
            if (!img || !img.width || !img.height) continue;
            const blob = await imageObjectToBlob(img);
            if (!blob || blob.size < 800) continue; // skip spacers/rules
            found.push({
              url: URL.createObjectURL(blob),
              blob,
              name: `page-${p}-${img.width}x${img.height}.png`,
              width: img.width,
              height: img.height,
              kind: KINDS[img.kind] || 'image'
            });
          } catch {
            /* image could not be decoded — skip */
          }
        }
        page.cleanup();
      }
      await task.destroy();
      setImages(found);
      if (!found.length) setError('No embedded images found — this PDF may only contain text or vector art.');
    } catch (err) {
      console.error(err);
      setError('Could not extract images from this PDF.');
    } finally {
      setBusy(false);
    }
  };

  const downloadOne = (img) => saveBlob(img.blob, img.name);
  const downloadAll = () => downloadZip(images.map((i) => ({ name: i.name, data: i.blob })), 'extracted-images.zip');

  return (
    <ToolLayout title="Extract Images" description="Pull every embedded image out of a PDF at its original resolution.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Extracting…' : 'Extract images'}
          </button>
          {images.length > 0 && <button className="tool-btn" onClick={downloadAll}>Download all as ZIP ({images.length})</button>}
        </div>

        {images.length > 0 && (
          <>
            <p className="form-note">{images.length} image{images.length > 1 ? 's' : ''} found — PNG, full resolution.</p>
            <div className="image-preview-grid">
              {images.map((img) => (
                <div key={img.name} className="preview-card">
                  <img src={img.url} alt={img.name} />
                  <div className="preview-label">{img.name}</div>
                  <button className="tool-btn" onClick={() => downloadOne(img)} style={{ marginTop: 8 }}>Download</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default ExtractImages;
