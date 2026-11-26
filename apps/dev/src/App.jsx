import { Link, NavLink, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from '@zegnite/shared-ui';
import { Icons } from './components/Icons.jsx';
import DevHome from './pages/DevHome.jsx';
import DevToolPage from './pages/DevToolPage.jsx';

function Navbar() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to="/" className="brand" aria-label="3toOneDev home">
          <span className="brand-mark"><Icons.Brand size={18} /></span>
          <span className="brand-text">
            <span className="brand-name">3toOneDev</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/json-formatter" end={false} className="nav-link">
            Playground
          </NavLink>
          <a href="/#tools" className="nav-link">All tools</a>
          <a href="/#seo" className="nav-link">SEO audits</a>
          <a href="/#api" className="nav-link">API</a>
          <a href="/#faq" className="nav-link">FAQ</a>
        </nav>
        <div className="nav-actions">
          <span className="nav-capsule">nothing leaves your browser</span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark"><Icons.Brand size={18} /></span>
            <span className="brand-text">
              <span className="brand-name">3toOneDev</span>
            </span>
          </Link>
          <p>Developer and SEO tools that run in your browser.</p>
        </div>
        <div className="footer-col">
          <h4>Popular tools</h4>
          <ul>
            <li><Link to="/json-formatter">JSON Formatter</Link></li>
            <li><a href="/#seo">Meta Tag Generator</a></li>
            <li><a href="/#seo">Speed Checker</a></li>
            <li><a href="/#tools">Regex Tester</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About 3toOneDev</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">DMCA</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} 3toOneDev.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />
      <main key={location.pathname} className="main-content">
        <Routes>
          <Route path="/" element={<DevHome />} />
          <Route path="/:slug" element={<DevToolPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
