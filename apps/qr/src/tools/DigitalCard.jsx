import { useEffect, useMemo, useState } from 'react';
import { QrPreview } from '../components/QrUI';
import { downloadUrl, shareUrl } from '../lib/qr';
import { safeHref } from '../lib/safe';

const vcardEscape = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export const DigitalCard = () => {
  const [name, setName] = useState('Asha Rao');
  const [role, setRole] = useState('Founder');
  const [org, setOrg] = useState('Asha’s Bakehouse');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('asha@example.com');
  const [website, setWebsite] = useState('https://3toone.in');
  const [about, setAbout] = useState('Small-batch cakes, cookies and celebration boxes in Pune.');
  const [accent, setAccent] = useState('#0F766E');
  const [url, setUrl] = useState('');

  const data = useMemo(() => ({ name, role, org, phone, email, website, about, accent }), [name, role, org, phone, email, website, about, accent]);

  useEffect(() => {
    setUrl(shareUrl('card', data));
  }, [data]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* clipboard may be blocked */ }
  };

  const downloadVcard = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${vcardEscape(name)}`,
      org ? `ORG:${vcardEscape(org)}` : '',
      role ? `TITLE:${vcardEscape(role)}` : '',
      phone ? `TEL;TYPE=CELL:${vcardEscape(phone)}` : '',
      email ? `EMAIL:${vcardEscape(email)}` : '',
      website ? `URL:${vcardEscape(website)}` : '',
      about ? `NOTE:${vcardEscape(about)}` : '',
      'END:VCARD'
    ].filter(Boolean);
    const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/vcard;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    downloadUrl(href, '3toone-digital-card.vcf');
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Card details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field">
            <label className="field-label">Full name</label>
            <div className="number-box wide"><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Role</label>
            <div className="number-box wide"><input value={role} onChange={(e) => setRole(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Company</label>
            <div className="number-box wide"><input value={org} onChange={(e) => setOrg(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Phone</label>
            <div className="number-box wide"><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Email</label>
            <div className="number-box wide"><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Website</label>
            <div className="number-box wide"><input value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
          </div>
          <div className="cal-field">
            <label className="field-label">Short about</label>
            <div className="number-box wide">
              <textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)} style={{ width: '100%', border: 0, outline: 0, resize: 'vertical', font: 'inherit', background: 'transparent' }} />
            </div>
          </div>
          <div className="cal-field">
            <label className="field-label">Accent colour</label>
            <div className="number-box wide">
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} style={{ width: 60, height: 32 }} />
              <span style={{ marginLeft: 8 }}>{accent}</span>
            </div>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-title"><h2>Card and QR</h2><span className="live-pill">Live</span></div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, color: '#0f172a', textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: 26 }}>
              {name.trim().charAt(0).toUpperCase() || '3'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{name || 'Your name'}</div>
            <div style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>{[role, org].filter(Boolean).join(' · ')}</div>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.55, margin: '12px 0 0' }}>{about}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
              {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="btn small" style={{ background: accent, color: '#fff', borderColor: accent }}>Call</a>}
              {email && <a href={`mailto:${email}`} className="btn small" style={{ background: accent, color: '#fff', borderColor: accent }}>Email</a>}
              {safeHref(website) && <a href={safeHref(website)} target="_blank" rel="noopener noreferrer" className="btn small" style={{ background: accent, color: '#fff', borderColor: accent }}>Website</a>}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {url ? <QrPreview value={url} fg={accent} label="Scan to open this card" /> : <span className="panel-note">Building card link…</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
            <button type="button" className="btn solid" onClick={downloadVcard}>Download vCard</button>
            <button type="button" className="btn" onClick={copy} disabled={!url}>Copy card link</button>
            {url && <a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open card</a>}
          </div>
          <p className="panel-note">The card content lives in the link, so there is no account or database. The vCard saves to your phone's contacts.</p>
        </div>
      </div>
    </section>
  );
};

export default DigitalCard;
