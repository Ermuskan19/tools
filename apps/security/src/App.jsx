import { Link } from 'react-router-dom';
import { Icons } from '@zegnite/shared-ui';
import { MAIN_SITE_URL } from './config/site';
import './styles/security.css';

const Navbar = () => (
  <nav className="navbar">
    <Link to="/" className="nav-brand">
      <div className="brand-icon"><Icons.Brand /></div>
      3toOne Security
    </Link>
    <div className="nav-links">
      {MAIN_SITE_URL && (
        <a href={MAIN_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">3toOne main site</a>
      )}
    </div>
    <span className="nav-tagline">nothing leaves your browser</span>
  </nav>
);

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="nav-brand">
          <div className="brand-icon"><Icons.Brand /></div>
          3toOne Security
        </Link>
        <p className="footer-tagline">
          Security tools are coming soon. Like every 3toOne tool, they will run entirely in your browser.
        </p>
      </div>
      {MAIN_SITE_URL && (
        <div className="footer-col">
          <h4>Main site</h4>
          <ul>
            <li>
              <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer">3toOne — all tools</a>
            </li>
          </ul>
        </div>
      )}
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} 3toOne. All rights reserved.</span>
      <span>Your files never leave your browser.</span>
    </div>
  </footer>
);

export const App = () => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      <div className="container coming-soon">
        <h1>Security tools — coming soon</h1>
        <p>We're working on free, browser-based security utilities. Check back soon, or explore the <a href="/" className="nav-link">PDF tools</a> and main tools.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default App;
