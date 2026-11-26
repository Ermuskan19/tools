import { Link } from 'react-router-dom';
import { Icons } from './Icons';
import { imgTools } from '../data/imgTools';

const popular = imgTools.slice(0, 6);

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark"><Icons.Logo /></span>
            <span className="brand-name">3toOneImg</span>
          </Link>
          <p className="footer-tag">28 image tools, built for India. Photos that pass every form.</p>
        </div>

        <div className="footer-col">
          <h4>Popular tools</h4>
          <ul>
            {popular.map((t) => (
              <li key={t.slug}><Link to={`/${t.slug}`}>{t.title}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Refunds</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>3toOne family</h4>
          <ul>
            <li><a href="#">PDF</a></li>
            <li><a href="#">Calc</a></li>
            <li><a href="#">Dev</a></li>
            <li><a href="#">Img</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 3toOneImg.</span>
      </div>
    </footer>
  );
}
