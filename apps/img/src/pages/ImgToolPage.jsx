import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icons, iconForCategory, toneForCategory } from '../components/Icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { imgTools, imgToolsBySlug } from '../data/imgTools';

const PRESETS = {
  'marketplace-image-maker': [
    { label: 'Amazon 1000x1000', w: 1000, h: 1000 },
    { label: 'Flipkart 1000x1000', w: 1000, h: 1000 },
    { label: 'Meesho 1024x1024', w: 1024, h: 1024 },
  ],
  passport: [
    { label: 'Passport 2x2in (600px)', w: 600, h: 600 },
  ],
};

const PRODUCT_SIZES = [
  { label: 'Instagram 1080x1080', w: 1080, h: 1080 },
  { label: 'Facebook 1200x630', w: 1200, h: 630 },
  { label: 'Amazon 1000x1000', w: 1000, h: 1000 },
  { label: 'Thumbnail 300x300', w: 300, h: 300 },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function ImgToolPage() {
  const { slug } = useParams();
  const tool = imgToolsBySlug[slug];

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [natural, setNatural] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [targetKb, setTargetKb] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(0);

  // crop
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);

  // text overlays
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(90);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');

  // filters
  const [blurRadius, setBlurRadius] = useState(0);
  const [sharpenAmt, setSharpenAmt] = useState(0);
  const [removeBg, setRemoveBg] = useState(false);
  const [threshold, setThreshold] = useState(150);
  const [bgTolerance, setBgTolerance] = useState(40);

  // watermark
  const [wmOpacity, setWmOpacity] = useState(0.5);

  // collage
  const [collageCols, setCollageCols] = useState(2);

  // passport sheet
  const [sheetCopies, setSheetCopies] = useState(6);

  // marketplace
  const [marketplacePreset, setMarketplacePreset] = useState(0);

  // outputs
  const [palette, setPalette] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [validation, setValidation] = useState([]);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const resultUrlRef = useRef(null);
  const ratioRef = useRef(1);

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem('3toone-recent');
      let recent = stored ? JSON.parse(stored) : [];
      recent = [slug, ...recent.filter((s) => s !== slug)].slice(0, 6);
      localStorage.setItem('3toone-recent', JSON.stringify(recent));
    } catch { /* storage unavailable */ }
  }, [slug]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultUrl(null);
    setResultSize(0);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      ratioRef.current = img.width / img.height;
      setNatural({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
      setCropX(0); setCropY(0); setCropW(img.width); setCropH(img.height);
      setReady((n) => n + 1);
    };
    img.src = url;
  };

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
    setFile(list[0]);
    setOriginalSize(list[0].size);
    const url = URL.createObjectURL(list[0]);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      ratioRef.current = img.width / img.height;
      setNatural({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
      setCropW(img.width); setCropH(img.height);
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

  const extractPalette = (canvas) => {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const counts = new Map();
    for (let i = 0; i < data.length; i += 16) {
      const r = (data[i] >> 5) << 5;
      const g = (data[i + 1] >> 5) << 5;
      const b = (data[i + 2] >> 5) << 5;
      const key = `${r},${g},${b}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    setPalette(sorted.map(([k]) => {
      const [r, g, b] = k.split(',').map(Number);
      return `rgb(${r},${g},${b})`;
    }));
  };

  const runValidation = () => {
    const checks = [];
    if (!file) { setValidation(checks); return; }
    checks.push({ label: 'File size under 25 MB', pass: file.size <= 25 * 1024 * 1024 });
    if (natural) {
      checks.push({ label: 'Width between 200 and 4000 px', pass: natural.w >= 200 && natural.w <= 4000 });
      checks.push({ label: 'Height between 200 and 4000 px', pass: natural.h >= 200 && natural.h <= 4000 });
      checks.push({ label: 'Aspect ratio not extreme', pass: Math.max(natural.w, natural.h) / Math.min(natural.w, natural.h) < 4 });
    }
    // background check: sample center vs corners
    if (imgRef.current) {
      const c = document.createElement('canvas');
      c.width = natural.w; c.height = natural.h;
      const ctx = c.getContext('2d');
      ctx.drawImage(imgRef.current, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let white = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) white++;
      }
      const whitePct = white / (d.length / 4);
      checks.push({ label: 'Background not too white (passport)', pass: whitePct < 0.7 });
    }
    setValidation(checks);
  };

  const process = useCallback(async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || width < 1 || height < 1) return;
    setProcessing(true);
    try {
      // special: collage
      if (slug === 'photo-collage-maker' && files.length > 1) {
        const imgs = await Promise.all(files.map((f) => loadImage(URL.createObjectURL(f))));
        const n = imgs.length;
        const cols = collageCols;
        const rows = Math.ceil(n / cols);
        const cellW = Math.floor(width / cols);
        const cellH = Math.floor(height / rows);
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        imgs.forEach((im, idx) => {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          // cover fit
          const scale = Math.max(cellW / im.width, cellH / im.height);
          const sw = cellW / scale, sh = cellH / scale;
          const sx = (im.width - sw) / 2, sy = (im.height - sh) / 2;
          ctx.drawImage(im, sx, sy, sw, sh, c * cellW, r * cellH, cellW, cellH);
        });
        await finishCanvas(canvas);
        return;
      }

      // special: passport sheet
      if (slug === 'passport-photo-sheet') {
        const pageW = 1200, pageH = 1800;
        canvas.width = pageW; canvas.height = pageH;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageW, pageH);
        const cols = 2;
        const rows = Math.max(1, Math.ceil(sheetCopies / cols));
        const margin = 30;
        const gap = 20;
        const maxW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
        const maxH = (pageH - margin * 2 - gap * (rows - 1)) / rows;
        const photoSize = Math.max(200, Math.floor(Math.min(600, maxW, maxH)));
        const gridW = cols * photoSize + gap * (cols - 1);
        const gridH = rows * photoSize + gap * (rows - 1);
        const startX = Math.round((pageW - gridW) / 2);
        const startY = Math.round((pageH - gridH) / 2);
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (idx >= sheetCopies) break;
            const x = startX + c * (photoSize + gap);
            const y = startY + r * (photoSize + gap);
            // cover-fit the uploaded photo into the square slot
            const scale = Math.max(photoSize / img.width, photoSize / img.height);
            const sw = photoSize / scale;
            const sh = photoSize / scale;
            const sx = (img.width - sw) / 2;
            const sy = (img.height - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, x, y, photoSize, photoSize);
            ctx.strokeStyle = '#9aa0a6';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, photoSize, photoSize);
            idx++;
          }
        }

        setWidth(pageW);
        setHeight(pageH);
        await finishCanvas(canvas, pageW, pageH);
        return;
      }

      // special: marketplace preset dimensions
      let targetW = width, targetH = height;
      if (slug === 'marketplace-image-maker') {
        const p = PRESETS['marketplace-image-maker'][marketplacePreset];
        targetW = p.w; targetH = p.h;
        setWidth(p.w); setHeight(p.h);
      }

      const rot = rotation % 360;
      const swapped = rot === 90 || rot === 270;
      canvas.width = swapped ? targetH : targetW;
      canvas.height = swapped ? targetW : targetH;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.imageSmoothingQuality = 'high';
      const sx = cropX, sy = cropY, sw = cropW || img.width, sh = cropH || img.height;
      ctx.drawImage(img, sx, sy, sw, sh, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();

      // filters
      if (blurRadius > 0) {
        // redraw with blur filter
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width; tmp.height = canvas.height;
        const tctx = tmp.getContext('2d');
        tctx.filter = `blur(${blurRadius}px)`;
        tctx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tmp, 0, 0);
      }

      if (sharpenAmt > 0) {
        const w = canvas.width, h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const src = imgData.data;
        const dst = new Uint8ClampedArray(src);
        const k = sharpenAmt;
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              const idx = (y * w + x) * 4 + c;
              const val = src[idx] * (1 + 4 * k)
                - src[((y - 1) * w + x) * 4 + c] * k
                - src[((y + 1) * w + x) * 4 + c] * k
                - src[(y * w + (x - 1)) * 4 + c] * k
                - src[(y * w + (x + 1)) * 4 + c] * k;
              dst[idx] = Math.max(0, Math.min(255, val));
            }
          }
        }
        imgData.data.set(dst);
        ctx.putImageData(imgData, 0, 0);
      }

      if (removeBg || slug === 'background-remover') {
        const w = canvas.width, h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (r > 255 - bgTolerance && g > 255 - bgTolerance && b > 255 - bgTolerance) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      if (slug === 'signature-extractor') {
        const w = canvas.width, h = canvas.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (gray > threshold) {
            d[i + 3] = 0;
          } else {
            d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // text overlays
      const drawText = (txt, yPct, size = fontSize, color = fontColor, outline = false) => {
        if (!txt) return;
        ctx.font = `bold ${size}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const x = (textX / 100) * canvas.width;
        const y = (yPct / 100) * canvas.height;
        if (outline) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(2, size / 12);
          ctx.strokeText(txt, x, y);
        }
        ctx.fillText(txt, x, y);
      };

      if (text) drawText(text, textY);
      if (slug === 'watermark-image' && text) {
        ctx.globalAlpha = wmOpacity;
        drawText(text, textY, fontSize, fontColor);
        ctx.globalAlpha = 1;
      }
      if (slug === 'meme-generator') {
        drawText(topText, 8, fontSize, '#ffffff', true);
        drawText(bottomText, 92, fontSize, '#ffffff', true);
      }
      if (slug === 'date-name-stamp' && text) {
        drawText(text, textY, fontSize, fontColor);
      }

      await finishCanvas(canvas, targetW, targetH);

      if (slug === 'color-palette-extractor') extractPalette(canvas);
      if (slug === 'photo-validator') runValidation();
    } finally {
      setProcessing(false);
    }
  }, [width, height, format, quality, rotation, flipH, flipV, targetKb, ready, slug, cropX, cropY, cropW, cropH, text, fontSize, fontColor, textX, textY, topText, bottomText, blurRadius, sharpenAmt, removeBg, threshold, bgTolerance, wmOpacity, files, collageCols, sheetCopies, marketplacePreset]);

  const finishCanvas = async (canvas, w, h) => {
    const doFinish = async () => {
      const q = quality;
      const runExport = async (qualityVal) => new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), format, qualityVal);
      });

      if (targetKb > 0 && format !== 'image/png') {
        let lo = 0.05, hi = 1, best = null;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          const blob = await runExport(mid);
          if (!blob) break;
          best = blob;
          const kb = blob.size / 1024;
          if (kb <= targetKb) lo = mid; else hi = mid;
        }
        if (best) finalize(best);
      } else {
        const blob = await runExport(q);
        if (blob) finalize(blob);
      }
    };

    const finalize = (blob) => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url);
      setResultSize(blob.size);
    };

    await doFinish();
  };

  useEffect(() => {
    if (ready > 0) process();
  }, [ready, process]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${slug || 'image'}-${width}x${height}.${format.split('/')[1] || 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPdf = async () => {
    if (!resultUrl) return;
    const blob = await fetch(resultUrl).then((r) => r.blob());
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    // build minimal PDF with DCTDecode image
    const w = width, h = height;
    const parts = [];
    const enc = new TextEncoder();
    const push = (s) => parts.push(enc.encode(s));
    push('%PDF-1.4\n');
    const offsets = [];
    const obj = (n, body) => {
      offsets[n] = parts.reduce((a, b) => a + b.length, 0);
      push(`${n} 0 obj\n${body}\nendobj\n`);
    };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>`);
    const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`;
    obj(4, `<< /Length ${content.length} >>\nstream\n${content}endstream`);
    obj(5, `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
    // append image bytes
    const imgStart = parts.reduce((a, b) => a + b.length, 0);
    parts.push(bytes);
    push('\nendstream\nendobj\n');
    const xrefPos = parts.reduce((a, b) => a + b.length, 0);
    push('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) {
      push(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    }
    push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`);
    const out = new Uint8Array(parts.reduce((a, b) => a + b.length, 0));
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.length; }
    const pdfBlob = new Blob([out], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url; a.download = `${slug}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const runOcr = async () => {
    if (!file) return;
    setOcrLoading(true);
    try {
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const { data } = await window.Tesseract.recognize(file, 'eng+hin');
      setOcrText(data.text || '');
    } catch (e) {
      setOcrText('OCR failed: ' + (e?.message || e));
    } finally {
      setOcrLoading(false);
    }
  };

  const processProductPack = async () => {
    if (!file || !imgRef.current) return;
    for (const sz of PRODUCT_SIZES) {
      setWidth(sz.w); setHeight(sz.h);
      await new Promise((r) => setTimeout(r, 50));
      await process();
      await new Promise((r) => setTimeout(r, 200));
      download();
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  if (!tool) {
    return (
      <div className="page">
        <Header />
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h1>Tool not found</h1>
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>We couldn't find that tool.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Back to all tools</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = iconForCategory(tool.category);
  const tone = toneForCategory(tool.category);
  const related = imgTools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4);

  const isCropper = slug === 'image-cropper';
  const isStamp = slug === 'date-name-stamp';
  const isWatermark = slug === 'watermark-image';
  const isMeme = slug === 'meme-generator';
  const isBlur = slug === 'blur-image';
  const isSharpen = slug === 'sharpen-image';
  const isBg = slug === 'background-remover';
  const isSig = slug === 'signature-extractor';
  const isUpscale = slug === 'image-upscaler';
  const isExif = slug === 'exif-viewer';
  const isPalette = slug === 'color-palette-extractor';
  const isOcr = slug === 'image-to-text-ocr';
  const isValidator = slug === 'photo-validator';
  const isCollage = slug === 'photo-collage-maker';
  const isPassportSheet = slug === 'passport-photo-sheet';
  const isMarketplace = slug === 'marketplace-image-maker';
  const isProductPack = slug === 'product-photo-pack';
  const isExam = slug === 'exam-photo-signature';
  const isPdf = slug === 'image-to-pdf-under-x-kb';

  return (
    <div className="page">
      <Header />
      <div className="container tool-page">
        <Link to="/" className="back-link"><Icons.Arrow style={{ transform: 'rotate(180deg)' }} /> Back to all tools</Link>

        <div className="tool-page-head">
          <div className={`tool-icon tone-${tone} lg`}><Icon /></div>
          <div>
            <div className="tool-breadcrumb">{tool.category.replace('-', ' & ')}</div>
            <h1>{tool.title}</h1>
            <p className="tool-page-tag">{tool.tagline}</p>
          </div>
        </div>

        <p className="tool-page-desc">{tool.description}</p>

        <div className="tool-workspace">
          <div className="workspace-card">
            <h3>Upload and edit an image</h3>
            {isCollage ? (
              <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ marginBottom: 12 }} />
            ) : isExam ? (
              <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                <input type="file" accept="image/*" onChange={handleFile} />
                <small style={{ color: 'var(--muted)' }}>Upload photo; upload signature separately below if needed (processes current image).</small>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleFile} style={{ marginBottom: 12 }} />
            )}
            {file && (
              <div style={{ display: 'grid', gap: 10 }}>
                {/* dimensions */}
                {!isPassportSheet && !isCollage && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--muted)' }}>Width</label>
                      <input type="number" min="1" value={width} onChange={(e) => onWidth(Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--muted)' }}>Height</label>
                      <input type="number" min="1" value={height} onChange={(e) => onHeight(Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Lock
                    </label>
                    {isUpscale && (
                      <>
                        <button type="button" className="btn btn-outline" onClick={() => { setWidth(natural.w * 2); setHeight(natural.h * 2); }}>2x</button>
                        <button type="button" className="btn btn-outline" onClick={() => { setWidth(natural.w * 4); setHeight(natural.h * 4); }}>4x</button>
                      </>
                    )}
                  </div>
                )}

                {/* crop */}
                {isCropper && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div><label style={{ fontSize: 12 }}>Crop X</label><input type="number" value={cropX} onChange={(e) => setCropX(Math.max(0, Number(e.target.value) || 0))} style={{ width: 70 }} /></div>
                    <div><label style={{ fontSize: 12 }}>Y</label><input type="number" value={cropY} onChange={(e) => setCropY(Math.max(0, Number(e.target.value) || 0))} style={{ width: 70 }} /></div>
                    <div><label style={{ fontSize: 12 }}>W</label><input type="number" value={cropW} onChange={(e) => setCropW(Math.max(1, Number(e.target.value) || 1))} style={{ width: 70 }} /></div>
                    <div><label style={{ fontSize: 12 }}>H</label><input type="number" value={cropH} onChange={(e) => setCropH(Math.max(1, Number(e.target.value) || 1))} style={{ width: 70 }} /></div>
                  </div>
                )}

                {/* rotate/flip */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)' }}>Rotate</label>
                    <select value={rotation} onChange={(e) => setRotation(Number(e.target.value))}>
                      <option value={0}>0°</option>
                      <option value={90}>90°</option>
                      <option value={180}>180°</option>
                      <option value={270}>270°</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} /> Flip H
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} /> Flip V
                  </label>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)' }}>Format</label>
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)' }}>Quality</label>
                    <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} />
                    <span style={{ fontSize: 12 }}>{Math.round(quality * 100)}%</span>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--muted)' }}>Target KB (0=off)</label>
                    <input type="number" min="0" value={targetKb} onChange={(e) => setTargetKb(Math.max(0, Number(e.target.value) || 0))} style={{ width: 80 }} />
                  </div>
                </div>

                {/* collage */}
                {isCollage && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label style={{ fontSize: 12 }}>Columns</label>
                    <input type="number" min="1" max="6" value={collageCols} onChange={(e) => setCollageCols(Math.max(1, Number(e.target.value) || 1))} style={{ width: 60 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{files.length} images</span>
                  </div>
                )}

                {/* passport sheet */}
                {isPassportSheet && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label style={{ fontSize: 12 }}>Copies</label>
                    <input type="number" min="1" max="12" value={sheetCopies} onChange={(e) => setSheetCopies(Math.max(1, Number(e.target.value) || 1))} style={{ width: 60 }} />
                  </div>
                )}

                {/* marketplace */}
                {isMarketplace && (
                  <div>
                    <label style={{ fontSize: 12 }}>Preset</label>
                    <select value={marketplacePreset} onChange={(e) => setMarketplacePreset(Number(e.target.value))}>
                      {PRESETS['marketplace-image-maker'].map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                    </select>
                  </div>
                )}

                {/* text overlays */}
                {(isStamp || isWatermark || isMeme) && (
                  <div style={{ display: 'grid', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Text</div>
                    {!isMeme && (
                      <>
                        <input type="text" placeholder="Text" value={text} onChange={(e) => setText(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div><label style={{ fontSize: 12 }}>Size</label><input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(8, Number(e.target.value) || 16))} style={{ width: 60 }} /></div>
                          <div><label style={{ fontSize: 12 }}>Color</label><input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} /></div>
                          <div><label style={{ fontSize: 12 }}>X %</label><input type="number" value={textX} onChange={(e) => setTextX(Math.max(0, Math.min(100, Number(e.target.value) || 50)))} style={{ width: 60 }} /></div>
                          <div><label style={{ fontSize: 12 }}>Y %</label><input type="number" value={textY} onChange={(e) => setTextY(Math.max(0, Math.min(100, Number(e.target.value) || 90)))} style={{ width: 60 }} /></div>
                        </div>
                      </>
                    )}
                    {isMeme && (
                      <>
                        <input type="text" placeholder="Top text" value={topText} onChange={(e) => setTopText(e.target.value)} />
                        <input type="text" placeholder="Bottom text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
                        <div><label style={{ fontSize: 12 }}>Size</label><input type="number" value={fontSize} onChange={(e) => setFontSize(Math.max(8, Number(e.target.value) || 32))} style={{ width: 60 }} /></div>
                      </>
                    )}
                    {isWatermark && (
                      <div>
                        <label style={{ fontSize: 12 }}>Opacity</label>
                        <input type="range" min="0.1" max="1" step="0.05" value={wmOpacity} onChange={(e) => setWmOpacity(parseFloat(e.target.value))} />
                        <span style={{ fontSize: 12 }}>{Math.round(wmOpacity * 100)}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* filters */}
                {isBlur && (
                  <div>
                    <label style={{ fontSize: 12 }}>Blur radius</label>
                    <input type="range" min="0" max="20" step="1" value={blurRadius} onChange={(e) => setBlurRadius(Number(e.target.value))} />
                    <span style={{ fontSize: 12 }}>{blurRadius}px</span>
                  </div>
                )}
                {isSharpen && (
                  <div>
                    <label style={{ fontSize: 12 }}>Sharpen</label>
                    <input type="range" min="0" max="2" step="0.1" value={sharpenAmt} onChange={(e) => setSharpenAmt(parseFloat(e.target.value))} />
                    <span style={{ fontSize: 12 }}>{sharpenAmt.toFixed(1)}</span>
                  </div>
                )}
                {isBg && (
                  <div>
                    <label style={{ fontSize: 12 }}>Background tolerance</label>
                    <input type="range" min="10" max="120" step="5" value={bgTolerance} onChange={(e) => setBgTolerance(Number(e.target.value))} />
                    <span style={{ fontSize: 12 }}>{bgTolerance}</span>
                  </div>
                )}
                {isSig && (
                  <div>
                    <label style={{ fontSize: 12 }}>Threshold</label>
                    <input type="range" min="50" max="230" step="5" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                    <span style={{ fontSize: 12 }}>{threshold}</span>
                  </div>
                )}

                {/* preview */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Original</div>
                    <img src={previewUrl} alt="Original" style={{ maxWidth: 240, maxHeight: 240 }} />
                    <div style={{ fontSize: 12 }}>{natural ? `${natural.w}×${natural.h}` : ''} · {(originalSize / 1024).toFixed(1)} KB</div>
                  </div>
                  {resultUrl && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Result</div>
                      <img src={resultUrl} alt="Result" style={{ maxWidth: 240, maxHeight: 240 }} />
                      <div style={{ fontSize: 12 }}>{width}×{height} · {(resultSize / 1024).toFixed(1)} KB</div>
                    </div>
                  )}
                </div>

                {/* palette output */}
                {isPalette && palette.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {palette.map((c) => (
                      <div key={c} style={{ width: 40, height: 40, background: c, borderRadius: 6, border: '1px solid #ccc' }} title={c} />
                    ))}
                  </div>
                )}

                {/* OCR output */}
                {isOcr && (
                  <div>
                    <button type="button" className="btn btn-primary" onClick={runOcr} disabled={ocrLoading || !file}>
                      {ocrLoading ? 'Running OCR…' : 'Run OCR'}
                    </button>
                    {ocrText && (
                      <textarea value={ocrText} readOnly style={{ width: '100%', minHeight: 120, marginTop: 8 }} />
                    )}
                  </div>
                )}

                {/* validation output */}
                {isValidator && (
                  <div>
                    <button type="button" className="btn btn-outline" onClick={runValidation}>Validate</button>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {validation.map((v) => (
                        <li key={v.label} style={{ color: v.pass ? 'green' : 'red' }}>{v.pass ? '✓' : '✗'} {v.label}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* exif info */}
                {isExif && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Re-encoding removes EXIF metadata. Original: {natural?.w}×{natural?.h}, {(originalSize / 1024).toFixed(1)} KB. Result is clean.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!isProductPack && (
                    <button type="button" className="btn btn-primary" onClick={process} disabled={processing}>
                      {processing ? 'Processing…' : 'Apply'}
                    </button>
                  )}
                  {isProductPack && (
                    <button type="button" className="btn btn-primary" onClick={processProductPack} disabled={processing}>
                      {processing ? 'Processing…' : 'Generate all sizes'}
                    </button>
                  )}
                  {resultUrl && (
                    <>
                      <button type="button" className="btn btn-outline" onClick={download}>Download</button>
                      {isPdf && <button type="button" className="btn btn-outline" onClick={downloadPdf}>Download PDF</button>}
                    </>
                  )}
                </div>
              </div>
            )}
            {!file && <div className="dropzone">Click to upload an image (PNG, JPG, WebP up to 25 MB)</div>}
          </div>
          <div className="workspace-card">
            <h3>How it works</h3>
            <ol className="steps">
              {tool.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        </div>

        {tool.faqs?.length ? (
          <div className="tool-faqs">
            <h2>FAQs</h2>
            {tool.faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary className="faq-q"><span>{f.q}</span><span className="faq-chevron"><Icons.Chevron /></span></summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        ) : null}

        {related.length ? (
          <div className="related">
            <h2>Related tools</h2>
            <div className="tools-grid compact">
              {related.map((t) => {
                const I = iconForCategory(t.category);
                const tn = toneForCategory(t.category);
                return (
                  <Link to={`/${t.slug}`} key={t.slug} className="tool-card">
                    <div className={`tool-icon tone-${tn}`}><I /></div>
                    <div className="tool-body">
                      <div className="tool-title-row">
                        <h3>{t.title}</h3>
                        {t.isNew && <span className="new-badge">New</span>}
                      </div>
                      <p>{t.tagline}</p>
                    </div>
                    <span className="tool-arrow"><Icons.Arrow /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />
    </div>
  );
}