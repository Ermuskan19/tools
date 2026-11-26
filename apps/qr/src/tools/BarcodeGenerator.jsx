import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { downloadSvg, downloadUrl } from '../lib/qr';

const FORMATS = [
  { value: 'CODE128', label: 'Code 128', sample: '3TOONE-001', hint: 'Letters, numbers and symbols.' },
  { value: 'EAN13', label: 'EAN-13', sample: '5901234123457', hint: '12 or 13 digits. The last digit is the check digit.' },
  { value: 'UPC', label: 'UPC-A', sample: '123456789999', hint: '11 or 12 digits.' },
  { value: 'CODE39', label: 'Code 39', sample: '3TOONE', hint: 'Uppercase letters, numbers and a few symbols.' }
];

export const BarcodeGenerator = () => {
  const [format, setFormat] = useState('CODE128');
  const [value, setValue] = useState('3TOONE-001');
  const [showText, setShowText] = useState(true);
  const [lineColor, setLineColor] = useState('#111827');
  const [error, setError] = useState('');
  const svgRef = useRef(null);
  const active = FORMATS.find((f) => f.value === format) || FORMATS[0];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    setError('');
    if (!value.trim()) {
      svg.innerHTML = '';
      return;
    }
    try {
      JsBarcode(svg, value.trim(), {
        format,
        displayValue: showText,
        lineColor,
        background: '#ffffff',
        width: 2,
        height: 90,
        margin: 12,
        font: 'monospace',
        fontSize: 16,
        textMargin: 6
      });
    } catch (e) {
      svg.innerHTML = '';
      setError(e?.message?.replace(/^.*?:/, '').trim() || 'That value is not valid for this barcode format.');
    }
  }, [format, value, showText, lineColor]);

  const changeFormat = (next) => {
    const spec = FORMATS.find((f) => f.value === next);
    setFormat(next);
    setValue(spec?.sample || '');
  };

  const pngDownload = () => {
    const svg = svgRef.current;
    if (!svg || !svg.childNodes.length) return;
    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      downloadUrl(canvas.toDataURL('image/png'), `barcode-${format.toLowerCase()}.png`);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Could not export the PNG. Try the SVG download.');
    };
    img.src = url;
  };

  const svgDownload = () => {
    const svg = svgRef.current;
    if (!svg || !svg.childNodes.length) return;
    downloadSvg(new XMLSerializer().serializeToString(svg), `barcode-${format.toLowerCase()}.svg`);
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Barcode details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field">
            <label className="field-label">Format</label>
            <div className="segment" style={{ flexWrap: 'wrap' }}>
              {FORMATS.map((f) => (
                <button key={f.value} type="button" className={`seg-btn ${format === f.value ? 'on' : ''}`} onClick={() => changeFormat(f.value)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="cal-field">
            <label className="field-label">Value</label>
            <div className="number-box wide">
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.sample} />
            </div>
            <p className="panel-note">{active.hint}</p>
          </div>
          <div className="cal-field">
            <label className="field-label">Bar colour</label>
            <div className="number-box wide">
              <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{lineColor}</span>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            Show the number under the bars
          </label>
          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Preview</h2><span className="live-pill">Live</span></div>
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, overflowX: 'auto', textAlign: 'center' }}>
            <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, justifyContent: 'center' }}>
            <button type="button" className="btn solid" onClick={pngDownload} disabled={Boolean(error) || !value.trim()}>Download PNG</button>
            <button type="button" className="btn" onClick={svgDownload} disabled={Boolean(error) || !value.trim()}>Download SVG</button>
          </div>
          <p className="panel-note">Print at 100% scale and test the barcode with a scanner before a full print run.</p>
        </div>
      </div>
    </section>
  );
};

export default BarcodeGenerator;
