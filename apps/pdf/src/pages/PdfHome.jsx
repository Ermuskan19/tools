import { useState } from 'react';
import { Icons, ToolCard } from '@zegnite/shared-ui';
import { pdfTools, pdfCategories } from '../data/pdfTools';

const CATEGORY_LABELS = {
  all: 'All',
  convert: 'Convert',
  organize: 'Organize',
  optimize: 'Optimize',
  'edit-sign': 'Edit & Sign',
  security: 'Security',
  india: 'Made for India'
};

const POPULAR_CHIPS = ['pdf-compressor', 'pdf-merger', 'pdf-to-word', 'sign-pdf', 'unlock-pdf'];

const WHY_CHOOSE = [
  {
    title: 'Exact-size compression',
    body: 'Pick 100 KB, 200 KB, 500 KB or 1 MB and the compressor tunes quality to fit the upload limit.'
  },
  {
    title: 'Hindi and Indic OCR',
    body: 'Turn scanned pages in Hindi and other Indian languages into searchable, copyable text.'
  },
  {
    title: 'Ready for Indian forms',
    body: 'Build application bundles, add KYC watermarks and mask Aadhaar digits in a few clicks.'
  },
  {
    title: 'Private by design',
    body: 'Files are processed in your browser where possible, and server copies are deleted within an hour.'
  }
];

const FAQS = [
  { q: 'Is 3toOne PDF free to use?', a: 'Yes. Most tools are free and need no sign-up.' },
  { q: 'Are my files safe?', a: 'Processing happens in your browser; nothing is uploaded to a server.' },
  { q: 'What is the maximum file size?', a: 'Depends on your device memory; typical documents of tens of MB work fine.' },
  { q: 'Can it read Hindi and other Indian languages?', a: 'Yes — Hindi and Indic OCR is supported.' },
  { q: 'Can I compress a PDF to an exact size?', a: 'Yes, pick a target KB and the compressor tunes quality to fit.' },
  { q: 'Do I need an account?', a: 'No.' },
  { q: 'What is 3toOne?', a: 'A browser-based collection of free utilities. Everything runs on your device.' }
];

export const PdfHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredTools = pdfTools
    .filter(
      (t) =>
        (activeCategory === 'all' || t.category === activeCategory) &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.status === 'live' ? 1 : 0) - (a.status === 'live' ? 1 : 0));

  const popularTools = pdfTools.filter((t) => POPULAR_CHIPS.includes(t.slug));

  const scrollToTools = () => {
    document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="hero">
        <div className="hero-main">
          <span className="hero-eyebrow">PDF tools, built for India</span>
          <h1>
            Every PDF job, <span className="text-gradient">done in seconds</span>
          </h1>
          <p>
            Merge, compress, convert, sign and fix PDFs. Plus exam-ready and KYC-ready tools made for Indian forms.
          </p>
          <div className="search-bar">
            <div className="search-container">
              <Icons.Search />
              <input
                type="text"
                className="search-input"
                placeholder="Search a tool eg. merger,compressor,Aadhaar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className="search-btn" onClick={scrollToTools}>
              Find tool
            </button>
          </div>
          <div className="hero-popular">
            <span className="popular-label">Popular</span>
            <span className="popular-sep">:</span>
            {popularTools.map((t) => (
              <a key={t.slug} href={`/${t.slug}`} className={`chip ${t.status === 'soon' ? 'chip-soon' : ''}`}>
                {t.title}{t.status === 'soon' && ' · Soon'}
              </a>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="demo-card">
            <div className="demo-label">PDF Compressor</div>
            <div className="demo-file">
              <span className="demo-file-icon"><Icons.Pdf /></span>
              <span>application-form.pdf</span>
            </div>
            <div className="demo-target">Target size: 200 KB</div>
            <div className="demo-progress">
              <div className="demo-progress-fill"></div>
            </div>
            <div className="demo-done">
              <div className="demo-done-info">
                <span className="demo-done-size">Done: 184 KB</span>
                <span className="demo-done-note">Ready for the job portal</span>
              </div>
              <a href="/pdf-compressor" className="demo-btn">
                Download
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container trust-bar">
        <div className="trust-item">
          <span>No sign-up for basic tools</span>
        </div>
        <div className="trust-item">
          <span>Hindi and Indic OCR</span>
        </div>
        <div className="trust-item">
          <span>Exact-size compression</span>
        </div>
        <div className="trust-item">
          <span>Files stay in your browser</span>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2 className="section-title">All PDF tools</h2>
          <span className="section-count">{pdfTools.length}</span>
        </div>
        <div className="category-tabs">
          {pdfCategories.map((cat) => (
            <button
              key={cat.key}
              className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {CATEGORY_LABELS[cat.key]}
              <span className="tab-count">({cat.count})</span>
            </button>
          ))}
        </div>
        <div className="tool-grid" id="tools-grid">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} href={`/${tool.slug}`} />
          ))}
          {filteredTools.length === 0 && (
            <div className="empty-state">
              <p>No tools match "{searchQuery}".</p>
              <button className="empty-reset" onClick={() => setSearchQuery('')}>
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container why-choose">
        <h2 className="section-title">Why people choose 3toOne PDF</h2>
        <div className="why-grid">
          {WHY_CHOOSE.map((w, i) => (
            <div key={i} className="why-item">
              <div className="why-num">{i + 1}</div>
              <div>
                <strong>{w.title}</strong>
                <p>{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container faq">
        <h2 className="section-title">Frequently asked questions</h2>
        <dl className="landing-faq">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <dt>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="faq-icon" aria-hidden="true"></span>
                </button>
              </dt>
              <dd className="faq-answer">
                <div>
                  <p>{f.a}</p>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="cta-section">
        <h2>Got a PDF to fix? Start in one click.</h2>
        <p>Free tools. No sign-up required, made for India.</p>
        <a href="#tools-grid" className="cta-btn">Browse all tools</a>
      </section>
    </>
  );
};

export default PdfHome;
