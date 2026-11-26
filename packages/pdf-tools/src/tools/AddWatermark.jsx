import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { applyImageWatermark, applyTextWatermark, WATERMARK_ANCHORS } from '../shared/watermark';

const AddWatermark = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [kind, setKind] = useState('text');
  const [watermark, setWatermark] = useState('CONFIDENTIAL');
  const [size, setSize] = useState(54);
  const [opacity, setOpacity] = useState(28);
  const [angle, setAngle] = useState(40);
  const [anchor, setAnchor] = useState('center');
  const [color, setColor] = useState('#6b4bb3');
  const [imageFile, setImageFile] = useState(null);
  const [imagePct, setImagePct] = useState(45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setError('Could not read this PDF.');
      setPageCount(0);
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file || !pageCount) return;
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });

      if (kind === 'image') {
        if (!imageFile) throw new Error('Choose a PNG or JPG image to use as the watermark.');
        await applyImageWatermark(src, new Uint8Array(await imageFile.arrayBuffer()), imageFile.type, {
          widthPct: imagePct,
          opacity: opacity / 100,
          angle,
          anchor
        });
      } else {
        if (!watermark.trim()) throw new Error('Enter the watermark text.');
        const hex = color.replace('#', '');
        const rgbColor = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
        await applyTextWatermark(src, {
          text: watermark,
          size,
          opacity: opacity / 100,
          angle,
          anchor,
          color: rgbColor
        });
      }

      const outBytes = await src.save({ useObjectStreams: true });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Watermark failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.pdf$/i, '')}-watermarked.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Add Watermark" description="Stamp text or an image across every page, with control over size, opacity and placement.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />

          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Watermark type</label>
              <select className="tool-input" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Placement</label>
              <select className="tool-input" value={anchor} onChange={(e) => setAnchor(e.target.value)}>
                {WATERMARK_ANCHORS.map((a) => (
                  <option key={a} value={a}>{a.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          {kind === 'text' ? (
            <>
              <label className="tool-label">Watermark text</label>
              <input className="tool-input" type="text" value={watermark} onChange={(e) => setWatermark(e.target.value)} placeholder="CONFIDENTIAL" />
              <div className="control-row">
                <div className="control-group grow">
                  <label className="tool-label">Font size: {size}pt</label>
                  <input type="range" min="12" max="140" value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </div>
                <div className="control-group">
                  <label className="tool-label">Colour</label>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="tool-label">Watermark image (PNG or JPG — a transparent PNG works best)</label>
              <input className="tool-input" type="file" accept="image/png,image/jpeg" onChange={(e) => setImageFile(e.target.files[0] || null)} />
              <label className="tool-label">Image width: {imagePct}% of page</label>
              <input type="range" min="10" max="90" value={imagePct} onChange={(e) => setImagePct(Number(e.target.value))} />
            </>
          )}

          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Opacity: {opacity}%</label>
              <input type="range" min="5" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </div>
            <div className="control-group grow">
              <label className="tool-label">Rotation: {angle}°</label>
              <input type="range" min="-90" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file || pageCount === 0}>
            {busy ? 'Adding watermark…' : `Add watermark to ${pageCount || 0} page${pageCount === 1 ? '' : 's'}`}
          </button>
          {resultUrl && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default AddWatermark;
