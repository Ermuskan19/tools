import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { PdfHome } from './pages/PdfHome';
import { PdfToolPage } from './pages/PdfToolPage';
import { Why3toOne } from './pages/Why3toOne';
import { Blog } from './pages/Blog';
import { FaqPage } from './pages/FaqPage';
import { Icons, ScrollToTop } from '@zegnite/shared-ui';
import { MAIN_SITE_URL } from './config/site';
import './styles/pdf.css';

const Navbar = () => {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div className="brand-icon"><Icons.Brand /></div>
        3toOne PDF
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/why-3toone" className={`nav-link ${isActive('/why-3toone') ? 'active' : ''}`}>Why3toOne</Link>
        <Link to="/blog" className={`nav-link ${isActive('/blog') ? 'active' : ''}`}>Blog</Link>
        <Link to="/faq" className={`nav-link ${isActive('/faq') ? 'active' : ''}`}>FAQ</Link>
      </div>
      <span className="nav-tagline">nothing leaves your browser</span>
    </nav>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="nav-brand">
          <div className="brand-icon"><Icons.Brand /></div>
          3toOne PDF
        </Link>
        <p className="footer-tagline">
          Free online PDF tools that run entirely in your browser. No sign-up,
          no uploads, no tracking — every tool runs entirely on your device.
        </p>
      </div>
      <div className="footer-col">
        <h4>Popular tools</h4>
        <ul>
          <li><Link to="/pdf-compressor">PDF Compressor</Link></li>
          <li><Link to="/pdf-merger">PDF Merger</Link></li>
          <li><Link to="/pdf-to-word">PDF to Word</Link></li>
          <li><Link to="/sign-pdf">Sign PDF</Link></li>
          <li><Link to="/unlock-pdf">Unlock PDF</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Company</h4>
        <ul>
          <li><Link to="/why-3toone">Why 3toOne</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Legal</h4>
        <ul>
          <li>
            <a href={MAIN_SITE_URL ? `${MAIN_SITE_URL}/privacy-policy` : '#'}>
              Privacy Policy
            </a>
          </li>
          <li>
            <a href={MAIN_SITE_URL ? `${MAIN_SITE_URL}/terms` : '#'}>
              Terms of Service
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} 3toOne. All rights reserved.</span>
      <span>Your files never leave your browser.</span>
    </div>
  </footer>
);

export const App = () => {
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PdfHome />} />
          <Route path="/why-3toone" element={<Why3toOne />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/:slug" element={<PdfToolPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
