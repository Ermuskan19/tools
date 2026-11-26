import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from './Icons';

const NAV = [
  { label: 'All tools', href: '/#tools' },
  { label: 'Quick start', href: '/#quick' },
  { label: 'Blog', href: '/#blog' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="3toOneImg home">
          <span className="brand-mark"><Icons.Logo /></span>
          <span className="brand-name">3toOneImg</span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="nav-link">{n.label}</a>
          ))}
        </nav>

        <span className="browser-capsule">nothing leaves your browser</span>

        <button className="menu-btn" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
          {open ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          <div className="container">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="mobile-link" onClick={() => setOpen(false)}>{n.label}</a>
            ))}
            <div className="mobile-actions">
              <span className="browser-capsule">nothing leaves your browser</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
