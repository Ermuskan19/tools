import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ScrollToTop } from '@zegnite/shared-ui';
import { QrHome } from './pages/QrHome';
import { QrToolPage } from './pages/QrToolPage';
import { BioPage } from './pages/BioPage';
import { CardPage } from './pages/CardPage';
import { Icons } from './components/Icons';
import { MAIN_SITE_URL } from './config/site';

const Navbar = () => {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <nav className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark"><Icons.Qr /></span>
          <span className="brand-text">
            3toOne <b>Qr</b>
          </span>
        </Link>
        <div className="nav-links">
          <Link to="/#tools" className="nav-link">All tools</Link>
          <Link to="/dynamic-qr" className="nav-link">Dynamic QR</Link>
          <Link to="/#faq" className="nav-link">FAQ</Link>
          {MAIN_SITE_URL && (
            <a href={MAIN_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">
              All tools
            </a>
          )}
        </div>
        <span className="nav-tagline">nothing leaves your browser</span>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="shell footer-grid">
      <div className="footer-brand">
        <Link to="/" className="brand">
          <span className="brand-mark"><Icons.Qr /></span>
          <span className="brand-text">3toOne <b>Qr</b></span>
        </Link>
        <p>
          QR codes made for Indian shops. Static QR codes are free forever and
          never expire.
        </p>
      </div>
      <div className="footer-col">
        <h4>Popular tools</h4>
        <ul>
          <li><Link to="/upi-qr-generator">UPI QR</Link></li>
          <li><Link to="/menu-qr">Menu QR</Link></li>
          <li><Link to="/google-review-qr">Google Review QR</Link></li>
          <li><Link to="/dynamic-qr">Dynamic QR</Link></li>
        </ul>
      </div>
      {MAIN_SITE_URL && (
      <div className="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href={`${MAIN_SITE_URL}/privacy-policy`}>Privacy Policy</a></li>
          <li><a href={`${MAIN_SITE_URL}/terms`}>Terms of Service</a></li>
        </ul>
      </div>
      )}
    </div>
    <div className="shell footer-bottom">
      <span>© {new Date().getFullYear()} 3toOne. All rights reserved.</span>
      <span>Static QR codes never expire or get locked.</span>
    </div>
  </footer>
);

export const App = () => {
  const { pathname } = useLocation();
  const minimal = pathname === '/bio' || pathname === '/card';
  return (
    <div className="app-container">
      {!minimal && <Navbar />}
      <ScrollToTop />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<QrHome />} />
          <Route path="/bio" element={<BioPage />} />
          <Route path="/card" element={<CardPage />} />
          <Route path="/:slug" element={<QrToolPage />} />
        </Routes>
      </main>
      {!minimal && <Footer />}
    </div>
  );
};

export default App;
