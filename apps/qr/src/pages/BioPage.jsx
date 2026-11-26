import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { decodeShare } from '../lib/qr';
import { safeHref } from '../lib/safe';

const readHash = (hash) => {
  const match = /(?:^#|&)data=([^&]+)/.exec(hash || '');
  return match ? decodeShare(decodeURIComponent(match[1])) : null;
};

export const BioPage = () => {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(readHash(location.hash));
    setLoaded(true);
  }, [location.hash]);

  const accent = data?.accent || '#0F766E';
  const links = Array.isArray(data?.links) ? data.links.slice(0, 12) : [];

  if (!loaded) {
    return <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: '#475569' }}>Loading page…</div>;
  }

  if (!data) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f0fdfa' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 26, color: '#0f172a' }}>This page link is incomplete</h1>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>Ask the owner for a fresh QR or link, or build your own page in a few seconds.</p>
          <Link to="/link-in-bio-builder" style={{ display: 'inline-block', marginTop: 8, background: accent, color: '#fff', padding: '12px 18px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Create a bio page</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '70vh', background: `linear-gradient(160deg, #f0fdfa 0%, #ffffff 60%, ${accent}14 100%)`, padding: 'clamp(20px,6vw,56px) 16px' }}>
      <main style={{ width: 'min(94vw, 460px)', margin: '0 auto', background: '#fff', border: '1px solid #ccfbf1', borderRadius: 26, padding: 'clamp(22px,6vw,34px)', boxShadow: '0 24px 70px rgba(15,23,42,.12)', textAlign: 'center' }}>
        <div style={{ width: 78, height: 78, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', margin: '0 auto 14px', fontSize: 30, fontWeight: 800 }}>
          {String(data.name || '3').trim().charAt(0).toUpperCase() || '3'}
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, letterSpacing: '-.5px', color: '#0f172a' }}>{data.name || 'My links'}</h1>
        {data.bio && <p style={{ margin: '0 0 22px', color: '#475569', lineHeight: 1.6, fontSize: 15 }}>{data.bio}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links.map((link) => {
            const href = safeHref(link.url);
            if (!href) return null;
            return (
              <a
                key={`${link.label}-${link.url}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{ display: 'block', padding: '13px 14px', borderRadius: 12, background: accent, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}
              >
                {link.label}
              </a>
            );
          })}
        </div>
        <Link to="/link-in-bio-builder" style={{ display: 'inline-block', marginTop: 24, color: '#64748b', fontSize: 12, textDecoration: 'none' }}>Made with 3toOne Qr</Link>
      </main>
    </div>
  );
};

export default BioPage;
