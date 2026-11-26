import { useEffect, useRef, useState } from 'react';
import { qrDataUrl, downloadUrl } from '../lib/qr';

const LAYOUTS = [
  { value: 'scan-to-pay', label: 'Scan to Pay', headline: 'Scan to pay', footer: 'UPI • GPay • PhonePe • Paytm' },
  { value: 'menu', label: 'Menu', headline: 'Scan for our menu', footer: 'Tap, browse and order' },
  { value: 'review', label: 'Google Review', headline: 'Loved your visit?', footer: 'Scan to leave a Google review' },
  { value: 'custom', label: 'Custom', headline: 'Scan me', footer: 'Point your camera at the code' }
];

const rounded = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const wrap = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => {
    const clipped = lines.length > maxLines && i === maxLines - 1 ? `${l.replace(/[.,;:]$/, '')}…` : l;
    ctx.fillText(clipped, x, y + i * lineHeight);
  });
};

const drawPoster = (canvas, { layout, business, target, amount, headline, footer, accent, qrImage }) => {
  const ctx = canvas.getContext('2d');
  const W = 900;
  const H = 1200;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = '#f0fdfa';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 22);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 44px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  wrap(ctx, business || 'Your business', W / 2, 120, 760, 52, 2);

  ctx.fillStyle = accent;
  ctx.font = '800 62px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  wrap(ctx, headline, W / 2, 250, 760, 70, 2);

  const cardX = 110;
  const cardY = 330;
  const cardW = 680;
  const cardH = 640;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#ffffff';
  rounded(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();
  ctx.restore();

  if (qrImage) {
    const qrSize = 470;
    ctx.drawImage(qrImage, (W - qrSize) / 2, cardY + 55, qrSize, qrSize);
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    wrap(ctx, 'Add a destination to create the QR code', W / 2, cardY + 290, 520, 42, 2);
  }

  ctx.fillStyle = '#334155';
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const detail = layout === 'scan-to-pay' && amount ? `Pay ₹${amount}` : (target || '').replace(/^https?:\/\//, '').slice(0, 54);
  wrap(ctx, detail, W / 2, cardY + 570, 600, 38, 2);

  ctx.fillStyle = '#0f172a';
  ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  wrap(ctx, footer || 'Scan with any UPI app', W / 2, 1060, 720, 40, 2);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('Made with 3toOne Qr', W / 2, 1145);
};

export const PosterMaker = () => {
  const [layout, setLayout] = useState('scan-to-pay');
  const [business, setBusiness] = useState('Sharma Sweet Shop');
  const [upiId, setUpiId] = useState('sharmasweets@okaxis');
  const [link, setLink] = useState('');
  const [amount, setAmount] = useState('');
  const [headline, setHeadline] = useState('Scan to pay');
  const [footer, setFooter] = useState('UPI • GPay • PhonePe • Paytm');
  const [accent, setAccent] = useState('#0F766E');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const payload = layout === 'scan-to-pay'
    ? `upi://pay?pa=${encodeURIComponent(upiId || '')}&pn=${encodeURIComponent(business || '')}${amount ? `&am=${encodeURIComponent(amount)}` : ''}&cu=INR`
    : link || '';

  const changeLayout = (value) => {
    const spec = LAYOUTS.find((l) => l.value === value);
    setLayout(value);
    setHeadline(spec.headline);
    setFooter(spec.footer);
  };

  useEffect(() => {
    let alive = true;
    if (!payload.trim()) {
      imageRef.current = null;
      drawPoster(canvasRef.current, { layout, business, target: payload, amount, headline, footer, accent, qrImage: null });
      return () => { alive = false; };
    }
    qrDataUrl(payload, { size: 900, dark: accent })
      .then((url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      }))
      .then((img) => {
        if (!alive) return;
        imageRef.current = img;
        drawPoster(canvasRef.current, { layout, business, target: payload, amount, headline, footer, accent, qrImage: img });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [payload, layout, business, amount, headline, footer, accent]);

  const download = () => {
    if (!canvasRef.current) return;
    downloadUrl(canvasRef.current.toDataURL('image/png'), `qr-poster-${layout}.png`);
  };

  const print = () => {
    if (!canvasRef.current) return;
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) return;
    win.document.write(`<html><head><title>QR poster</title></head><body style="margin:0"><img src="${canvasRef.current.toDataURL('image/png')}" style="width:100%;display:block" onload="window.print()" /></body></html>`);
    win.document.close();
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Poster details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field">
            <label className="field-label">Layout</label>
            <div className="segment" style={{ flexWrap: 'wrap' }}>
              {LAYOUTS.map((l) => (
                <button key={l.value} type="button" className={`seg-btn ${layout === l.value ? 'on' : ''}`} onClick={() => changeLayout(l.value)}>{l.label}</button>
              ))}
            </div>
          </div>
          <div className="cal-field">
            <label className="field-label">Business name</label>
            <div className="number-box wide"><input value={business} onChange={(e) => setBusiness(e.target.value)} /></div>
          </div>
          {layout === 'scan-to-pay' ? (
            <>
              <div className="cal-field">
                <label className="field-label">UPI ID</label>
                <div className="number-box wide"><input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourshop@bank" /></div>
              </div>
              <div className="cal-field">
                <label className="field-label">Fixed amount (optional)</label>
                <div className="number-box wide"><input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="250" /></div>
              </div>
            </>
          ) : (
            <div className="cal-field">
              <label className="field-label">Destination link</label>
              <div className="number-box wide"><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" /></div>
            </div>
          )}
          <div className="cal-field">
            <label className="field-label">Headline</label>
            <div className="number-box wide"><input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Footer line</label>
            <div className="number-box wide"><input value={footer} onChange={(e) => setFooter(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Accent colour</label>
            <div className="number-box wide">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{accent}</span>
            </div>
          </div>
          <p className="panel-note">Poster is exported at 900 × 1200 px — a clean A4/standee ratio for printing.</p>
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Poster preview</h2><span className="live-pill">Live</span></div>
          <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', borderRadius: 12 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, justifyContent: 'center' }}>
            <button type="button" className="btn solid" onClick={download} disabled={!payload.trim()}>Download PNG</button>
            <button type="button" className="btn" onClick={print} disabled={!payload.trim()}>Print</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PosterMaker;
