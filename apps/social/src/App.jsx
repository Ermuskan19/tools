import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from '@zegnite/shared-ui';
import SocialHome from './pages/SocialHome.jsx';
import SocialToolPage from './pages/SocialToolPage.jsx';

const Logo = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="3toOne Social logo">
    <rect width="40" height="40" rx="12" fill="#BE185D" />
    <rect x="9" y="10" width="22" height="16" rx="5" fill="#fff" />
    <path d="M14 25h7l-6 6z" fill="#fff" />
    <circle cx="29" cy="10" r="4.5" fill="#FACC15" />
  </svg>
);

function Navbar() {
  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px clamp(20px,5vw,72px)', borderBottom: '1px solid #F3D5E6', background: '#fff' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }} aria-label="3toOne Social home">
        <Logo size={42} />
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.6px' }}>3toOne Social</span>
          <span style={{ fontSize: 11.5, color: '#6B4A66', fontWeight: 500 }}>Powered by 3toOne</span>
        </span>
      </Link>
      <nav aria-label="Main" style={{ display: 'flex', flexWrap: 'wrap', gap: 28, fontWeight: 500, fontSize: 14.5 }}>
        <a href="#studio">Caption studio</a>
        <a href="#tools">All tools</a>
        <a href="#calendar">Calendar</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ padding: '6px 14px', background: '#BE185D', color: '#fff', borderRadius: 999, fontWeight: 600, fontSize: 13 }}>Nothing leaves your browser</span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ padding: '52px clamp(20px,5vw,72px) 26px', background: '#FBE5F0', color: '#4A2C46' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={36} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <b style={{ fontSize: 20, color: '#2B1030' }}>3toOne Social</b>
              <span style={{ fontSize: 11.5 }}>Powered by 3toOne</span>
            </span>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>Grow faster on Instagram and YouTube. A 3toOne product.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, fontSize: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <b style={{ color: '#2B1030' }}>Popular tools</b>
            <Link to="/instagram-caption-generator">Caption Generator</Link>
            <Link to="/hashtag-generator">Hashtag Generator</Link>
            <Link to="/reel-ideas-generator">Reel Ideas</Link>
            <Link to="/youtube-title-generator">YouTube Titles</Link>
          </div>

        </div>
      </div>
      <div style={{ maxWidth: 1160, margin: '36px auto 0', paddingTop: 20, borderTop: '1px solid #EDC3D9', fontSize: 13, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
        <span>© {new Date().getFullYear()} 3toOne Social. A 3toOne product.</span>
        <span>Powered by 3toOne</span>
      </div>
    </footer>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <ScrollToTop />
      <Navbar />
      <main key={location.pathname} style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<SocialHome />} />
          <Route path="/:slug" element={<SocialToolPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
