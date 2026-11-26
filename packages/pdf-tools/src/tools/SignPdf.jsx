import { useEffect, useRef, useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const POSITIONS = {
  'bottom-right': 'Bottom right',
  'bottom-center': 'Bottom center',
  'bottom-left': 'Bottom left',
  'top-right': 'Top right',
  center: 'Center'
};

const SignPdf = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState('draw');
  const [sigData, setSigData] = useState(null);
  const [typedName, setTypedName] = useState('');
  const [page, setPage] = useState(0);
  const [position, setPosition] = useState('bottom-right');
  const [widthPct, setWidthPct] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setSigData(null);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setPage(0);
    } catch {
      setError('Could not read this PDF.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const pointOf = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const start = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    const ctx = canvas.getContext('2d');
    const p = pointOf(e);
    drawingRef.current = true;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const p = pointOf(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setSigData(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setSigData(null);
  };

  const typedToImage = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 260;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.font = 'italic 110px "Segoe Script", "Brush Script MT", cursive';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 24, canvas.height / 2, canvas.width - 48);
    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if (mode !== 'type') return;
    if (!typedName.trim()) {
      setSigData(null);
      return;
    }
    const id = setTimeout(() => setSigData(typedToImage(typedName.trim())), 120);
    return () => clearTimeout(id);
  }, [typedName, mode]);

  const uploadSignature = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g)$/i.test(f.type)) {
      setError('Upload a PNG or JPG image of your signature.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSigData(reader.result);
    reader.readAsDataURL(f);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file || !pageCount) return;
    if (!sigData) { setError('Add a signature first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
      const target = src.getPages()[Math.min(page, pageCount - 1)];
      const { width, height } = target.getSize();
      const png = sigData.split(',')[1];
      const image = await src.embedPng(Uint8Array.from(atob(png), (c) => c.charCodeAt(0)));
      const w = (width * widthPct) / 100;
      const h = (image.height / image.width) * w;
      const margin = 36;
      let x = width - margin - w;
      let y = margin;
      if (position === 'bottom-left') x = margin;
      if (position === 'bottom-center') x = (width - w) / 2;
      if (position === 'top-right') { y = height - margin - h; }
      if (position === 'center') { x = (width - w) / 2; y = (height - h) / 2; }
      target.drawImage(image, { x, y, width: w, height: h });

      const outBytes = await src.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Signing failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-signed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Sign PDF" description="Draw, type or upload a signature and stamp it on any page.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && pageCount > 0 && (
          <>
            <div className="control-row">
              <div className="control-group">
                <label className="tool-label">Signature</label>
                <select className="tool-input" value={mode} onChange={(e) => { setMode(e.target.value); setSigData(null); }}>
                  <option value="draw">Draw</option>
                  <option value="type">Type</option>
                  <option value="upload">Upload image</option>
                </select>
              </div>
              <div className="control-group">
                <label className="tool-label">Page</label>
                <select className="tool-input" value={page} onChange={(e) => setPage(Number(e.target.value))}>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <option key={i} value={i}>Page {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <label className="tool-label">Position</label>
                <select className="tool-input" value={position} onChange={(e) => setPosition(e.target.value)}>
                  {Object.entries(POSITIONS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div className="control-group">
                <label className="tool-label">Width: {widthPct}%</label>
                <input type="range" min="10" max="70" value={widthPct} onChange={(e) => setWidthPct(Number(e.target.value))} />
              </div>
            </div>

            {mode === 'draw' && (
              <>
                <canvas
                  ref={canvasRef}
                  width={620}
                  height={200}
                  className="sig-canvas"
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerLeave={end}
                />
                <div className="sig-actions">
                  <button className="tool-btn" onClick={clear}>Clear</button>
                  <span className="form-note">{sigData ? 'Signature captured.' : 'Sign in the box above.'}</span>
                </div>
              </>
            )}

            {mode === 'type' && (
              <>
                <input
                  className="tool-input"
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your name"
                />
                {sigData && <img src={sigData} alt="Typed signature preview" className="sig-preview" />}
              </>
            )}

            {mode === 'upload' && (
              <>
                <input className="tool-input" type="file" accept="image/png,image/jpeg" onChange={uploadSignature} />
                {sigData && <img src={sigData} alt="Uploaded signature preview" className="sig-preview" />}
              </>
            )}
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0 || !sigData}>
            {busy ? 'Signing…' : 'Sign PDF'}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download signed PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default SignPdf;
