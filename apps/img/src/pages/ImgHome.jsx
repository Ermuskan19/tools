import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icons, iconForCategory, toneForCategory } from '../components/Icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  imgTools,
  imgCategories,
  quickStarts,
  whyCards,
  pricingPlans,
  blogPosts,
  homeFaqs,
  IMG_SITE,
} from '../data/imgTools';

const PRESETS = [
  { name: 'SSC', kb: 42, orig: 3.2 },
  { name: 'UPSC', kb: 55, orig: 4.1 },
  { name: 'NEET', kb: 30, orig: 2.8 },
  { name: 'JEE', kb: 40, orig: 3.0 },
  { name: 'IBPS', kb: 45, orig: 3.4 },
  { name: 'SBI', kb: 50, orig: 3.6 },
];

const POPULAR_CHIPS = ['Exam photo', 'Compress to KB', 'Passport sheet', 'Remove background', 'Resize'];

export default function ImgHome() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [quick, setQuick] = useState(null);
  const [preset, setPreset] = useState(0);
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(0);
  const toolsRef = useRef(null);

  const quickObj = quick ? quickStarts.find((q) => q.key === quick) : null;

  const filtered = imgTools.filter((t) => {
    if (quickObj && !quickObj.tools.includes(t.slug)) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.keywords.join(' ').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setQuick(null);
    scrollToTools();
  };

  const chipClick = (chip) => {
    setQuick(null);
    setQuery(chip);
    scrollToTools();
  };

  const quickClick = (key) => {
    setQuick((prev) => (prev === key ? null : key));
    setCategory('all');
    setQuery('');
    scrollToTools();
  };

  const p = PRESETS[preset];

  return (
    <div className="page">
      <Header />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{imgTools.length} image tools, built for India</span>
            <h1>Photos that pass every form.</h1>
            <p className="hero-sub">
              Resize, compress and clean images for exams, IDs and online stores. Exact sizes, exact KB, zero guesswork.
            </p>
            <form className="search-bar" onSubmit={handleSearch}>
              <span className="search-icon"><Icons.Search /></span>
              <input
                type="text"
                placeholder="Search a tool, e.g. exam photo, 50 KB, passport"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setQuick(null); }}
              />
              <button type="submit" className="btn btn-primary">Find tool</button>
            </form>
            <div className="chips">
              {POPULAR_CHIPS.map((c) => (
                <button key={c} type="button" className="chip" onClick={() => chipClick(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-head">
              <span className="hero-card-title">EXAM PHOTO MAKER</span>
              <label className="preset-select">
                Preset:
                <select value={preset} onChange={(e) => setPreset(Number(e.target.value))}>
                  {PRESETS.map((pr, i) => (
                    <option key={pr.name} value={i}>{pr.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="hero-card-body">
              <div className="preview-row">
                <div className="preview-box">
                  <span className="preview-label">Original</span>
                  <div className="preview-img original" />
                  <span className="preview-meta">{p.orig} MB</span>
                </div>
                <span className="preview-arrow"><Icons.Arrow /></span>
                <div className="preview-box">
                  <span className="preview-label">Form-ready</span>
                  <div className="preview-img ready" />
                  <span className="preview-meta">{p.kb} KB</span>
                </div>
              </div>
              <div className="pass-badge">
                <span className="pass-icon"><Icons.Check /></span>
                <div>
                  <strong>Passes form rules</strong>
                  <span>Size, KB limit and format checked</span>
                </div>
              </div>
              <button className="btn btn-primary btn-block" type="button">
                <Icons.Download /> Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="trust">
        <div className="container trust-grid">
          <div className="trust-item"><Icons.Check /> No sign-up for basic tools</div>
          <div className="trust-item"><Icons.Check /> Exam presets built in</div>
          <div className="trust-item"><Icons.Check /> Exact-KB compression</div>
          <div className="trust-item"><Icons.Clock /> Files auto-deleted within 1 hour</div>
        </div>
      </section>

      {/* Quick start */}
      <section className="section" id="quick">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow-plain">Quick start</span>
            <h2>What are you preparing today?</h2>
            <p className="section-sub">Choose your job and open the right tool with the rules already applied.</p>
          </div>
          <div className="quick-grid">
            {quickStarts.map((q) => (
              <div key={q.key} className={`quick-card ${quick === q.key ? 'active' : ''}`}>
                <div className={`quick-icon tone-${q.tone}`}><Icons.Image /></div>
                <h3>{q.title}</h3>
                <p>{q.desc}</p>
                <div className="quick-tags">
                  {q.tags.map((t) => <span key={t} className="quick-tag">{t}</span>)}
                </div>
                <button type="button" className="btn btn-outline btn-block" onClick={() => quickClick(q.key)}>
                  {q.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All tools */}
      <section className="section" id="tools" ref={toolsRef}>
        <div className="container">
          <div className="section-head row">
            <div>
              <h2>All tools</h2>
              <p className="section-sub">{filtered.length} of {imgTools.length} tools</p>
            </div>
          </div>

          <div className="filter-pills">
            {imgCategories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`pill ${category === c.key && !quick ? 'active' : ''}`}
                onClick={() => { setCategory(c.key); setQuick(null); }}
              >
                {c.label} <span className="pill-count">{c.count}</span>
              </button>
            ))}
            {quick && (
              <button type="button" className="pill active" onClick={() => setQuick(null)}>
                {quickObj?.title} ✕
              </button>
            )}
          </div>

          <div className="tools-grid">
            {filtered.map((t) => {
              const Icon = iconForCategory(t.category);
              const tone = toneForCategory(t.category);
              return (
                <Link to={`/${t.slug}`} key={t.slug} className="tool-card">
                  <div className={`tool-icon tone-${tone}`}><Icon /></div>
                  <div className="tool-body">
                    <div className="tool-title-row">
                      <h3>{t.title}</h3>
                      {t.isNew && <span className="new-badge">New</span>}
                    </div>
                    <p>{t.tagline}</p>
                  </div>
                  <span className="tool-arrow"><Icons.Arrow /></span>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-state">No tools match. Try a different search.</div>
            )}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section section-alt" id="why">
        <div className="container">
          <div className="section-head">
            <h2>Why 3toOneImg</h2>
          </div>
          <div className="why-grid">
            {whyCards.map((w) => (
              <div key={w.title} className="why-card">
                <div className="why-icon"><Icons.Check /></div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Blog */}
      <section className="section section-alt" id="blog">
        <div className="container">
          <div className="section-head">
            <h2>Learn the photo rules</h2>
          </div>
          <div className="blog-grid">
            {blogPosts.map((b) => (
              <article key={b.title} className={`blog-card ${b.featured ? 'featured' : ''}`}>
                <span className="blog-tag">{b.tag}</span>
                <h3>{b.title}</h3>
                <span className="blog-read">{b.read}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container narrow">
          <div className="section-head center">
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {homeFaqs.map((f, i) => (
              <div key={f.q} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button type="button" className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="faq-chevron"><Icons.Chevron /></span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Got a photo to fix? Start in one click.</h2>
          <a href="#tools" className="btn btn-primary btn-lg">Browse all tools</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
