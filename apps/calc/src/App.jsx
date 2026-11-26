import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ScrollToTop } from '@zegnite/shared-ui';
import { CalcHome } from './pages/CalcHome';
import { CalcToolPage } from './pages/CalcToolPage';
import { Icons } from './components/Icons';
import { MAIN_SITE_URL } from './config/site';

const Navbar = () => {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <nav className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark"><Icons.Brand /></span>
          <span className="brand-text">
            3toOne <b>Calc</b>
          </span>
        </Link>
        <div className="nav-links">
          <Link to="/#favourites" className="nav-link">Favourites</Link>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>All calculators</Link>
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
          <span className="brand-mark"><Icons.Brand /></span>
          <span className="brand-text">3toOne <b>Calc</b></span>
        </Link>
        <p>
          Money and date math, the Indian way. Results are estimates for
          planning, not financial, tax or legal advice.
        </p>
      </div>
      <div className="footer-col">
        <h4>Popular</h4>
        <ul>
          <li><Link to="/emi-calculator">EMI Calculator</Link></li>
          <li><Link to="/fd-calculator">FD Calculator</Link></li>
          <li><Link to="/income-tax-calculator">Income Tax</Link></li>
          <li><Link to="/sip-calculator">SIP Calculator</Link></li>
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
      <span>Results are estimates for planning, not financial advice.</span>
    </div>
  </footer>
);

export const App = () => (
  <div className="app-container">
    <Navbar />
    <ScrollToTop />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<CalcHome />} />
        <Route path="/:slug" element={<CalcToolPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
