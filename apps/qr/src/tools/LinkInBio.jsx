import { useEffect, useMemo, useState } from 'react';
import { QrPreview } from '../components/QrUI';
import { downloadUrl, shareUrl } from '../lib/qr';
import { safeHref } from '../lib/safe';

const parseLinks = (text) => text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [label, ...rest] = line.split('|');
    return { label: (label || '').trim(), url: rest.join('|').trim() };
  })
  .filter((l) => l.label && l.url)
  .slice(0, 8);

const initialLinks = 'Order on WhatsApp | https://wa.me/919876543210\nSee the menu | https://3toone.in';

export const LinkInBio = () => {
  const [name, setName] = useState('Asha’s Bakehouse');
  const [bio, setBio] = useState('Small-batch cakes and cookies, baked fresh in Pune.');
  const [linksText, setLinksText] = useState(initialLinks);
  const [accent, setAccent] = useState('#0F766E');
  const [url, setUrl] = useState('');

  const links = useMemo(() => parseLinks(linksText), [linksText]);
  const shareData = useMemo(() => ({ name, bio, links, accent }), [name, bio, links, accent]);

  useEffect(() => {
    setUrl(shareUrl('bio', shareData));
  }, [shareData]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* clipboard may be blocked */ }
  };

  const downloadHtml = () => {
    const safe = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const linkMarkup = links
      .filter((l) => safeHref(l.url))
      .map((l) => `<a href="${safe(safeHref(l.url))}" target="_blank" rel="noopener noreferrer">${safe(l.label)}</a>`)
      .join('\n');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${safe(name)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f0fdfa;font-family:system-ui,sans-serif;color:#0f172a}.card{width:min(92vw,420px);background:#fff;border:1px solid #ccfbf1;border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.1);text-align:center}.avatar{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:0 auto 14px;background:${safe(accent)};color:#fff;font-size:28px;font-weight:800}h1{font-size:24px;margin:0 0 8px}p{color:#475569;line-height:1.55;margin:0 0 20px}a{display:block;padding:13px;margin:10px 0;border-radius:12px;background:${safe(accent)};color:#fff;text-decoration:none;font-weight:700}</style></head><body><main class="card"><div class="avatar">${safe(name.trim().charAt(0).toUpperCase() || '3')}</div><h1>${safe(name)}</h1><p>${safe(bio)}</p>${linkMarkup}</main></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    downloadUrl(href, 'link-in-bio.html');
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const tooLong = url.length > 1800;

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Page details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field">
            <label className="field-label">Page name</label>
            <div className="number-box wide"><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Short bio</label>
            <div className="number-box wide">
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', border: 0, outline: 0, resize: 'vertical', font: 'inherit', background: 'transparent' }} />
            </div>
          </div>
          <div className="cal-field">
            <label className="field-label">Links — one per line: Label | URL</label>
            <div className="number-box wide">
              <textarea rows={7} value={linksText} onChange={(e) => setLinksText(e.target.value)} spellCheck={false} style={{ width: '100%', border: 0, outline: 0, resize: 'vertical', font: '13px/1.5 ui-monospace, monospace', background: 'transparent' }} />
            </div>
            <p className="panel-note">Up to 8 links. Keep labels short so the QR stays easy to scan.</p>
          </div>
          <div className="cal-field">
            <label className="field-label">Button colour</label>
            <div className="number-box wide">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{accent}</span>
            </div>
          </div>
          {tooLong && <p className="panel-note" style={{ color: '#b45309' }}>This page has a lot of text, so the QR is dense. Shorten the bio or remove a link if your phone struggles to scan it.</p>}
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Your page and QR</h2><span className="live-pill">Live</span></div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 22, textAlign: 'center', color: '#0f172a' }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: 24 }}>{name.trim().charAt(0).toUpperCase() || '3'}</div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{name || 'Your page'}</div>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.55, margin: '8px 0 16px' }}>{bio}</p>
            {links.map((l) => (
              <div key={`${l.label}-${l.url}`} style={{ background: accent, color: '#fff', borderRadius: 10, padding: '10px 12px', fontWeight: 700, fontSize: 14, marginTop: 8 }}>{l.label}</div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            {url ? <QrPreview value={url} fg={accent} label="Scan to open your page" /> : <span className="panel-note">Building page link…</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
            <button type="button" className="btn solid" onClick={copy} disabled={!url}>Copy page link</button>
            {url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open page</a>}
            <button type="button" className="btn" onClick={downloadHtml}>Download HTML</button>
          </div>
          <p className="panel-note">The page content is encoded in the link itself. No account or database is needed, and the QR works as long as this site is online.</p>
        </div>
      </div>
    </section>
  );
};

export default LinkInBio;
