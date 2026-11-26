import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { decodeShare, downloadUrl } from '../lib/qr';
import { safeHref } from '../lib/safe';

const readHash = (hash) => {
  const match = /(?:^#|&)data=([^&]+)/.exec(hash || '');
  return match ? decodeShare(decodeURIComponent(match[1])) : null;
};

const vcardEscape = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export const CardPage = () => {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(readHash(location.hash));
    setLoaded(true);
  }, [location.hash]);

  const accent = data?.accent || '#0F766E';
  const phone = String(data?.phone || '');
  const email = String(data?.email || '');
  const website = safeHref(data?.website);

  const saveContact = () => {
    if (!data) return;
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${vcardEscape(data.name)}`,
      data.org ? `ORG:${vcardEscape(data.org)}` : '',
      data.role ? `TITLE:${vcardEscape(data.role)}` : '',
      phone ? `TEL;TYPE=CELL:${vcardEscape(phone)}` : '',
      email ? `EMAIL:${vcardEscape(email)}` : '',
      website ? `URL:${vcardEscape(website)}` : '',
      data.about ? `NOTE:${vcardEscape(data.about)}` : '',
      'END:VCARD'
    ].filter(Boolean);
    const blob = new Blob([`${lines.join('\r\n')}\r\n`], { type: 'text/vcard;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    downloadUrl(href, `${(data.name || 'contact').replace(/\s+/g, '-').toLowerCase()}.vcf`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  if (!loaded) {
    return <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: '#475569' }}>Loading card…</div>;
  }

  if (!data) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f0fdfa' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 26, color: '#0f172a' }}>This card link is incomplete</h1>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>Ask the owner for a fresh QR or link, or create your own card in a few seconds.</p>
          <Link to="/digital-visiting-card" style={{ display: 'inline-block', marginTop: 8, background: accent, color: '#fff', padding: '12px 18px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Create a card</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '70vh', background: `linear-gradient(160deg, #f0fdfa 0%, #ffffff 60%, ${accent}14 100%)`, padding: 'clamp(20px,6vw,56px) 16px' }}>
      <main style={{ width: 'min(94vw, 460px)', margin: '0 auto', background: '#fff', border: '1px solid #ccfbf1', borderRadius: 26, padding: 'clamp(22px,6vw,34px)', boxShadow: '0 24px 70px rgba(15,23,42,.12)', textAlign: 'center' }}>
        <div style={{ width: 82, height: 82, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 32, fontWeight: 800 }}>
          {String(data.name || '3').trim().charAt(0).toUpperCase() || '3'}
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 27, letterSpacing: '-.5px', color: '#0f172a' }}>{data.name || 'My card'}</h1>
        <div style={{ color: '#475569', fontWeight: 600, fontSize: 14 }}>{[data.role, data.org].filter(Boolean).join(' · ')}</div>
        {data.about && <p style={{ margin: '14px 0 20px', color: '#475569', lineHeight: 1.6, fontSize: 15 }}>{data.about}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} style={{ padding: '12px 14px', borderRadius: 11, background: accent, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Call {phone}</a>
          )}
          {email && (
            <a href={`mailto:${email}`} style={{ padding: '12px 14px', borderRadius: 11, background: accent, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Email</a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer nofollow" style={{ padding: '12px 14px', borderRadius: 11, background: accent, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Website</a>
          )}
          <button type="button" onClick={saveContact} style={{ padding: '12px 14px', borderRadius: 11, border: `1.5px solid ${accent}`, background: '#fff', color: accent, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Save contact
          </button>
        </div>
        <Link to="/digital-visiting-card" style={{ display: 'inline-block', marginTop: 24, color: '#64748b', fontSize: 12, textDecoration: 'none' }}>Made with 3toOne Qr</Link>
      </main>
    </div>
  );
};

export default CardPage;
