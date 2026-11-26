import { useState, useRef, useCallback, useEffect } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { getExam, listExams, DOCUMENT_TYPES } from '../data/exam-formats';

const KB = 1024;

const drawBanner = (ctx, w, h, bannerName, bannerDate) => {
  if (!bannerName && !bannerDate) return;
  const stripH = Math.max(24, Math.round(h * 0.10));
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, h - stripH, w, stripH);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(14, Math.round(w / 22));
  ctx.font = `bold ${fontSize}px sans-serif`;
  const lines = [];
  if (bannerName) lines.push(bannerName.toUpperCase());
  if (bannerDate) lines.push(bannerDate);
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h - stripH / 2 + (i - (lines.length - 1) / 2) * (fontSize + 4));
  });
};

const ExamDocResizer = () => {
  const [docType, setDocType] = useState('photo');
  const [examId, setExamId] = useState('cuet');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(230);
  const [targetKb, setTargetKb] = useState(100);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.85);
  const [lock, setLock] = useState(true);
  const [bannerName, setBannerName] = useState('');
  const [bannerDate, setBannerDate] = useState('');
  const [natural, setNatural] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [validation, setValidation] = useState(null);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const ratioRef = useRef(1);
  const resultUrlRef = useRef(null);
  const processTriggerRef = useRef(0);

  const exam = getExam(examId);
  const spec = docType === 'document'
    ? (exam.documents.find((d) => d.id === 'cert') ?? {})
    : exam[docType];
  const bannerRequired = docType === 'photo' && Boolean(spec.banner);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setOriginalSize(f.size);
    setResultUrl(null);
    setValidation(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    if (f.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        ratioRef.current = img.width / img.height;
        setNatural({ w: img.width, h: img.height });
        if (spec.width && spec.height) {
          setWidth(spec.width);
          setHeight(spec.height);
        } else {
          setWidth(img.width);
          setHeight(img.height);
        }
        setTargetKb(spec.maxKb ?? 100);
      };
      img.src = url;
    } else {
      setNatural(null);
      if (spec.maxKb) setTargetKb(spec.maxKb);
    }
  };

  const onExamChange = (id) => {
    setExamId(id);
    const ex = getExam(id);
    const sp = docType === 'document'
      ? (ex.documents.find((d) => d.id === 'cert') ?? {})
      : ex[docType];
    if (sp.width && sp.height) {
      setWidth(sp.width);
      setHeight(sp.height);
    }
    if (sp.maxKb) setTargetKb(sp.maxKb);
    setOutputFormat(sp.format ?? 'image/jpeg');
    setValidation(null);
  };

  const onDocTypeChange = (t) => {
    setDocType(t);
    setExamId('cuet');
    onExamChange('cuet');
  };

  const onWidth = (w) => {
    setWidth(w);
    if (lock && ratioRef.current) setHeight(Math.max(1, Math.round(w / ratioRef.current)));
  };
  const onHeight = (h) => {
    setHeight(h);
    if (lock && ratioRef.current) setWidth(Math.max(1, Math.round(h * ratioRef.current)));
  };

  const compressToKb = useCallback(async (img, w, h, targetKbVal, outFmt, bannerReq, bName, bDate) => {
    if (!img) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    if (bannerReq) drawBanner(ctx, w, h, bName, bDate);

    let lo = 0.1;
    let hi = 1.0;
    let best = null;
    let bestBlob = null;

    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      const blob = await new Promise((resolve) => {
        if (outFmt === 'image/png') {
          canvas.toBlob((b) => resolve(b), 'image/png');
        } else {
          canvas.toBlob((b) => resolve(b), outFmt, mid);
        }
      });
      if (!blob) break;
      const sizeKb = blob.size / KB;
      if (sizeKb <= targetKbVal) {
        best = mid;
        bestBlob = blob;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return { blob: bestBlob, quality: best };
  }, []);

  const process = useCallback(async () => {
    if (!file) return;
    if (file.type.startsWith('image/') && (!imgRef.current || width < 1 || height < 1)) return;
    setProcessing(true);

    let resultBlob;
    let effectiveQuality = quality;

    if (file.type.startsWith('image/')) {
      const compressed = await compressToKb(
        imgRef.current,
        width,
        height,
        targetKb,
        outputFormat,
        bannerRequired,
        bannerName,
        bannerDate
      );
      resultBlob = compressed?.blob ?? null;
      if (compressed?.quality !== null) effectiveQuality = compressed.quality;
    } else {
      resultBlob = file.slice(0, file.size, file.type);
    }

    if (!resultBlob) {
      setProcessing(false);
      return;
    }

    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    const url = URL.createObjectURL(resultBlob);
    resultUrlRef.current = url;
    setResultUrl(url);
    setResultSize(resultBlob.size);
    setQuality(effectiveQuality);

    const sizeKb = resultBlob.size / KB;
    let ok = true;
    let message = `Result: ${sizeKb.toFixed(1)} KB`;
    if (spec.minKb !== null && sizeKb < spec.minKb) {
      ok = false;
      message += ` — below exam minimum ${spec.minKb} KB`;
    }
    if (spec.maxKb !== null && sizeKb > spec.maxKb) {
      ok = false;
      message += ` — above exam maximum ${spec.maxKb} KB`;
    }
    setValidation({ ok, message });
    setProcessing(false);
  }, [file, width, height, targetKb, outputFormat, quality, bannerRequired, bannerName, bannerDate, spec.minKb, spec.maxKb, compressToKb]);

  useEffect(() => {
    if (!file) return;
    processTriggerRef.current += 1;
    void process();
  }, [file, width, height, targetKb, outputFormat, quality, process, bannerRequired, bannerName, bannerDate]);

  const download = () => {
    if (!resultUrl) return;
    const ext = outputFormat.split('/')[1] === 'jpeg' ? 'jpg' : outputFormat.split('/')[1];
    const typeLabel = docType === 'document' ? (spec.label || 'doc') : docType;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${examId}-${typeLabel}-${width}x${height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pctSaved = originalSize && resultSize && resultSize < originalSize
    ? Math.round(((originalSize - resultSize) / originalSize) * 100)
    : 0;

  const sizeHint = spec.width && spec.height
    ? `${spec.width}×${spec.height} px`
    : 'enter custom px';

  return (
    <ToolLayout
      title="Exam Doc Resizer"
      description="Resize exam photos, signatures and documents to the exact format required by SSC, CUET, NEET, JEE, NDA, UPSC, IBPS, CTET, GATE and SBI — entirely in your browser."
    >
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-group">
            <label className="tool-label">Document type</label>
            <div className="doc-type-tabs">
              {DOCUMENT_TYPES.map((t) => (
                <button
                  key={t}
                  className={`doc-tab ${docType === t ? 'active' : ''}`}
                  onClick={() => onDocTypeChange(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="tool-label">Select exam</label>
            <select className="tool-input" value={examId} onChange={(e) => onExamChange(e.target.value)}>
              {listExams().map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.label}
                </option>
              ))}
            </select>
            <span className="control-hint">{exam.body}</span>
          </div>

          {docType !== 'document' && (
            <>
              <div className="control-group">
                <label className="tool-label">Width (px)</label>
                <input
                  className="tool-input"
                  type="number"
                  min="1"
                  disabled={spec.width !== null}
                  value={width}
                  onChange={(e) => onWidth(Math.max(1, Number(e.target.value) || 1))}
                />
                <span className="control-hint">
                  {spec.width !== null ? `Preset: ${sizeHint} · ${spec.dpi} dpi approx.` : 'custom'}
                </span>
              </div>
              <div className="control-group">
                <label className="tool-label">Height (px)</label>
                <input
                  className="tool-input"
                  type="number"
                  min="1"
                  disabled={spec.height !== null}
                  value={height}
                  onChange={(e) => onHeight(Math.max(1, Number(e.target.value) || 1))}
                />
                <span className="control-hint">{spec.height !== null ? 'locked to preset' : 'custom'}</span>
              </div>
              <div className="control-group">
                <label className="tool-label">Target size (KB)</label>
                <input
                  className="tool-input"
                  type="number"
                  min="1"
                  value={targetKb || ''}
                  onChange={(e) => setTargetKb(Number(e.target.value) || 1)}
                />
                <span className="control-hint">
                  Exam range: {spec.minKb ?? '–'} – {spec.maxKb ?? '–'} KB
                </span>
              </div>
            </>
          )}

          {docType === 'document' && spec.maxKb !== null && (
            <div className="control-group">
              <label className="tool-label">Allowed size (KB)</label>
              <span className="control-hint">
                {spec.minKb ?? '–'} – {spec.maxKb} KB · {spec.format ?? 'any'}
              </span>
            </div>
          )}

          <div className="control-group">
            <label className="tool-label">Output format</label>
            <select className="tool-input" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              <option value="image/jpeg">JPEG / JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          {outputFormat !== 'image/png' && (
            <div className="control-group">
              <label className="tool-label">Quality</label>
              <input
                className="tool-input"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
              />
              <span className="control-value">{Math.round(quality * 100)}%</span>
            </div>
          )}

          {bannerRequired && (
            <fieldset className="banner-fieldset">
              <legend className="banner-legend">UPSC / NDA name + date banner</legend>
              <div className="control-row">
                <div className="control-group">
                  <label className="tool-label">Candidate name</label>
                  <input
                    className="tool-input"
                    type="text"
                    placeholder="RAVI KUMAR"
                    value={bannerName}
                    onChange={(e) => setBannerName(e.target.value)}
                  />
                </div>
                <div className="control-group">
                  <label className="tool-label">Date (DD/MM/YYYY)</label>
                  <input
                    className="tool-input"
                    type="text"
                    placeholder="01/01/2026"
                    value={bannerDate}
                    onChange={(e) => setBannerDate(e.target.value)}
                  />
                </div>
              </div>
              <span className="control-hint">
                Printed in a white strip at the bottom of the photo, as required by UPSC/NDA.
              </span>
            </fieldset>
          )}

          {file && (
            <label className="check-row">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
              Lock aspect ratio {natural ? `(${natural.w}×${natural.h} original)` : ''}
            </label>
          )}
        </div>

        <label className="tool-label">Upload file</label>
        <input
          className="tool-input"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFile}
        />
        {file && (
          <div className="control-row">
            <span className="control-hint">
              {file.name} · {(file.size / KB).toFixed(1)} KB · {file.type}
            </span>
          </div>
        )}

        <div className="image-preview">
          {file ? (
            <>
              <div className="preview-card original">
                {file.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="Original" />
                ) : (
                  <div className="pdf-icon">📄</div>
                )}
                <div className="preview-label">
                  Original {natural ? `(${natural.w}×${natural.h})` : ''} ·
                  {(originalSize / KB).toFixed(1)} KB
                </div>
              </div>
              {resultUrl && (
                <div className="preview-card result">
                  {file.type.startsWith('image/') ? (
                    <img src={resultUrl} alt="Resized" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  ) : (
                    <div className="pdf-icon">📄</div>
                  )}
                  <div className="preview-label">
                    Resized ({width}×{height} · {(resultSize / KB).toFixed(1)} KB
                    {pctSaved > 0 ? ` · ${pctSaved}% smaller` : ''})
                  </div>
                  {validation && (
                    <div
                      className={`validation ${validation.ok ? 'validation-ok' : 'validation-warn'}`}
                    >
                      {validation.message}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="drop-zone">
              Click to upload a photo, signature or document (JPEG, PNG, WebP, PDF)
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />

        {resultUrl && (
          <div className="tool-actions">
            <button className="tool-btn tool-btn-primary" onClick={download} disabled={processing}>
              {processing ? 'Processing…' : `Download ${examId} ${docType}`}
            </button>
          </div>
        )}

        <div className="exam-note">
          <strong>Important:</strong> Exam boards change upload rules between cycles. Always verify
          dimensions, KB limits and format against your official notification before submitting.
          Nothing is uploaded — processing happens entirely in your browser.
        </div>
      </div>
    </ToolLayout>
  );
};

export default ExamDocResizer;
