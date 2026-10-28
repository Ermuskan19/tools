import { useState, useEffect, useSyncExternalStore } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Icons } from './components/Icons';
import { ToolLanding } from './components/ToolLanding';
import { toolsData, toolsBySlug } from './data/tools';
import './App.css';
import './tools.css';

import { JsonFormatter } from './tools/JsonFormatter';
import ImageOptimizer from './tools/ImageOptimizer';
import RegexTester from './tools/RegexTester';
import LoremIpsum from './tools/LoremIpsum';
import Base64 from './tools/Base64';
import GradientMaker from './tools/GradientMaker';
import WordCounter from './tools/WordCounter';
import PasswordGenerator from './tools/PasswordGenerator';
import QrCodeGenerator from './tools/QrCodeGenerator';
import HashGenerator from './tools/HashGenerator';
import CaseConverter from './tools/CaseConverter';
import UuidGenerator from './tools/UuidGenerator';
import UrlEncode from './tools/UrlEncode';
import ImageConverter from './tools/ImageConverter';
import ImageResizer from './tools/ImageResizer';
import BackgroundRemover from './tools/BackgroundRemover';
import PdfMerger from './tools/PdfMerger';
import PdfSplitter from './tools/PdfSplitter';
import PdfCompressor from './tools/PdfCompressor';
import PdfToWord from './tools/PdfToWord';
import WordToPdf from './tools/WordToPdf';
import GstCalculator from './tools/GstCalculator';
import EmiCalculator from './tools/EmiCalculator';
import MetaTagGenerator from './tools/MetaTagGenerator';
import KeywordDensityChecker from './tools/KeywordDensityChecker';
import HashtagGenerator from './tools/HashtagGenerator';
import YoutubeTitleGenerator from './tools/YoutubeTitleGenerator';
import BioGenerator from './tools/BioGenerator';
import ExamDocResizer from './tools/ExamDocResizer';
import heroPlant from './assets/hero-plant.webp';

const ToolComponents = {
  'json-formatter': JsonFormatter,
  'image-optimizer': ImageOptimizer,
  'regex-tester': RegexTester,
  'lorem-ipsum': LoremIpsum,
  'base64': Base64,
  'css-gradient': GradientMaker,
  'word-counter': WordCounter,
  'password-generator': PasswordGenerator,
  'qr-code-generator': QrCodeGenerator,
  'hash-generator': HashGenerator,
  'case-converter': CaseConverter,
  'uuid-generator': UuidGenerator,
  'url-encode': UrlEncode,
  'image-converter': ImageConverter,
  'image-resizer': ImageResizer,
  'background-remover': BackgroundRemover,
  'jpg-to-png': ImageConverter,
  'png-to-jpg': ImageConverter,
  'pdf-merger': PdfMerger,
  'pdf-splitter': PdfSplitter,
  'pdf-compressor': PdfCompressor,
  'pdf-to-word': PdfToWord,
  'word-to-pdf': WordToPdf,
  'gst-calculator': GstCalculator,
  'emi-calculator': EmiCalculator,
  'meta-tag-generator': MetaTagGenerator,
  'keyword-density-checker': KeywordDensityChecker,
  'hashtag-generator': HashtagGenerator,
  'youtube-title-generator': YoutubeTitleGenerator,
  'bio-generator': BioGenerator,
  'exam-doc-resizer': ExamDocResizer
};

// Preset props for tools that share a component but need different defaults.
const ToolPresets = {
  'jpg-to-png': { defaultFormat: 'image/png' },
  'png-to-jpg': { defaultFormat: 'image/jpeg' }
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'dev', label: 'Dev Tools' },
  { key: 'text', label: 'Text Tools' },
  { key: 'docs', label: 'Documents' },
  { key: 'calc', label: 'Calculators' },
  { key: 'security', label: 'Security' },
  { key: 'media', label: 'Media' },
  { key: 'design', label: 'Design' }
];

// --- Components ---

const Navbar = () => {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div className="brand-icon"><Icons.Brand /></div>
        3toOne
      </Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Dev Tools</Link>
        <Link to="/tools/exam-doc-resizer" className={`nav-link ${isActive('/tools/exam-doc-resizer') ? 'active' : ''}`}>Exam Specific</Link>
      </div>
      <span className="nav-tagline"> nothing leaves your browser</span>
    </nav>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const FOOTER_CATEGORIES = [
  { key: 'docs', label: 'Documents' },
  { key: 'media', label: 'Media & Images' },
  { key: 'text', label: 'Text & Social' },
  { key: 'dev', label: 'Developer' },
  { key: 'calc', label: 'Calculators' },
  { key: 'security', label: 'Security' },
  { key: 'design', label: 'Design' }
];

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="nav-brand">
          <div className="brand-icon"><Icons.Brand /></div>
          3toOne
        </Link>
        <p className="footer-tagline">
          Premium-quality browser utilities, free forever. No sign-up, no uploads,
          no tracking — every tool runs entirely on your device.
        </p>
      </div>
      <div className="footer-cols">
        {FOOTER_CATEGORIES.map((cat) => {
          const tools = toolsData.filter((t) => t.category === cat.key);
          if (!tools.length) return null;
          return (
            <div key={cat.key} className="footer-col">
              <h4>{cat.label}</h4>
              <ul>
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link to={`/tools/${tool.slug}`}>{tool.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} 3toOne. All rights reserved.</span>
      <span>Your files never leave your browser.</span>
    </div>
  </footer>
);

const Hero = ({ searchQuery, setSearchQuery }) => (
  <header className="hero">
    <div className="hero-main">
      <span className="hero-eyebrow">Everything at one place</span>
      <h1>
        All Your Tools in <span className="text-gradient">One Place</span>
      </h1>
      <p>PDF, images, text, dev utilities, calculators, and more — premium quality, free forever, and nothing ever leaves your browser.</p>

      <div className="search-container">
        <Icons.Search />
        <input
          type="text"
          className="search-input"
          placeholder="Search for tools... (e.g. JSON, Image)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
    <div className="hero-visual">
      <img src={heroPlant} alt="Potted snake plant on a desk" width="512" height="512" />
    </div>
  </header>
);

const ToolCard = ({ tool }) => {
  const IconComponent = Icons[tool.icon];
  return (
    <Link to={`/tools/${tool.slug}`} className="card-link">
      <div className={`tool-card${tool.popular ? ' popular' : ''}`} data-category={tool.category}>
        {tool.popular && <span className="tool-badge">Popular</span>}
        <div className="card-header">
          <div className="card-icon">
            <IconComponent />
          </div>
          <Icons.ArrowRight />
        </div>
        <div className="card-content">
          <h3>{tool.title}</h3>
          <p>{tool.description}</p>
        </div>
        <div className="card-tags">
          {tool.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </Link>
  );
};

const PopularSection = () => {
  const popularTools = toolsData.filter((t) => t.popular);
  if (!popularTools.length) return null;
  return (
    <div className="container popular-section">
      <div className="section-header">
        <h2 className="section-title">Popular tools</h2>
        <span className="section-count">{popularTools.length}</span>
      </div>
      <div className="tool-grid">
        {popularTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};

const Home = ({ searchQuery, setSearchQuery, activeCategory, setActiveCategory, recentlyUsed }) => {
  const recentSlugs = recentlyUsed || [];
  const recentTools = recentSlugs.map(s => toolsBySlug[s]).filter(Boolean);
  const filteredTools = toolsData
    .filter(tool =>
      (activeCategory === 'all' || tool.category === activeCategory) &&
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => Number(b.popular) - Number(a.popular));

  return (
    <>
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {recentTools.length > 0 && (
        <div className="container recent-section">
          <h2 className="section-title">Recently Used</h2>
          <div className="recent-chips">
            {recentTools.map(tool => {
              const ChipIcon = Icons[tool.icon];
              return (
                <Link key={tool.id} to={`/tools/${tool.slug}`} className="recent-chip">
                  <ChipIcon className="chip-icon" /> {tool.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <div className="container category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {activeCategory === 'all' && !searchQuery && <PopularSection />}
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{activeCategory === 'all' && !searchQuery ? 'All tools' : 'Results'}</h2>
          <span className="section-count">{filteredTools.length}</span>
        </div>
        <div className="tool-grid">
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
          {filteredTools.length === 0 && (
            <div className="empty-state">
              <p>No tools match "{searchQuery}".</p>
              <button className="empty-reset" onClick={() => setSearchQuery('')}>Clear search</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const NotFound = () => (
  <div className="tool-page">
    <div className="tool-page-header">
      <Link to="/" className="tool-back">
        <Icons.ArrowLeft className="back-arrow" /> Back to tools
      </Link>
      <div className="tool-info">
        <h1 className="tool-title">Tool not found</h1>
        <p className="tool-desc">The tool you're looking for doesn't exist.</p>
      </div>
    </div>
  </div>
);

const ToolPage = () => {
  const { slug } = useLocationParams();
  const Component = ToolComponents[slug];
  const tool = toolsBySlug[slug];

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem('zegnite-recent');
      let recent = stored ? JSON.parse(stored) : [];
      recent = [slug, ...recent.filter(s => s !== slug)].slice(0, 6);
      localStorage.setItem('zegnite-recent', JSON.stringify(recent));
    } catch { /* storage unavailable (private mode) — ignore */ }
  }, [slug]);

  if (!Component || !tool) return <NotFound />;

  return (
    <>
      <Component {...ToolPresets[slug]} title={tool.title} description={tool.description} />
      <div className="container">
        <ToolLanding tool={tool} />
      </div>
    </>
  );
};

// --- Main Application ---

// Recently-used list lives in localStorage — an external store, so it is read
// via useSyncExternalStore: the prerendered HTML always matches the first paint.
let recentRawCache = '[]';
let recentValueCache = [];
const readRecent = () => {
  if (typeof window === 'undefined') return recentValueCache;
  let raw = '[]';
  try { raw = localStorage.getItem('zegnite-recent') || '[]'; } catch { /* private mode */ }
  if (raw !== recentRawCache) {
    recentRawCache = raw;
    try { recentValueCache = JSON.parse(raw); } catch { recentValueCache = []; }
  }
  return recentValueCache;
};
const subscribeRecent = (onChange) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const recentlyUsed = useSyncExternalStore(subscribeRecent, readRecent, () => recentValueCache);
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} recentlyUsed={recentlyUsed} />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// Tiny helper to read the :slug param from the current route
function useLocationParams() {
  const location = useLocation();
  const parts = location.pathname.split('/');
  return { slug: parts[2] || null };
}

export default App;
