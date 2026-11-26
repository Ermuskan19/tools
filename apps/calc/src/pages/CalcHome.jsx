import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { calcTools, calcCategories } from '../data/calcTools';

const NO_BADGE = new Set(['emi-calculator', 'loan-calculator', 'gst-calculator']);
const iconTint = (cat) => {
  if (cat === 'tax') return 'amber';
  if (cat === 'exams') return 'blue';
  if (cat === 'everyday') return 'purple';
  if (cat === 'business') return 'gray';
  return 'teal';
};

const FAVOURITES = ['emi-calculator', 'income-tax-calculator', 'sip-calculator', 'fd-calculator'];

const POPULAR = ['emi-calculator', 'income-tax-calculator', 'sip-calculator', 'fd-calculator', 'inhand-salary-calculator'];

const WHY = [
  {
    icon: 'Check',
    title: 'Built on Indian rules',
    body: 'GST slabs, old and new tax regimes, EPF and exam age cutoffs, not generic global formulas.'
  },
  {
    icon: 'ArrowRight',
    title: 'Results you can share',
    body: 'Every result gets a link, so you can send the exact numbers to family, a client or a lender.'
  },
  {
    icon: 'Receipt',
    title: 'Reports and invoices',
    body: 'Download a PDF of your EMI table, or turn a GST calculation into an invoice in one step.'
  },
  {
    icon: 'Compare',
    title: 'Compare scenarios',
    body: 'See how prepayment, a different bank or a new regime changes your numbers side by side.'
  }
];

const FAQS = [
  { q: 'Are the calculators really free?', a: 'Yes. Every calculator is free with full results and no sign-up. Everything runs in your browser; no account or sign-up is needed.' },
  { q: 'How accurate are the results?', a: 'They use standard Indian formulas and the FY 2025-26 slabs. Results are estimates for planning; check final numbers with your lender or a qualified professional.' },
  { q: 'Is this financial or tax advice?', a: 'No. Results are estimates for planning. They are not financial, tax or legal advice.' },
  { q: 'Can I share or save my result?', a: 'Yes. The EMI calculator has a share link and a PDF export. Share links carry the loan numbers only, never your income or other EMIs.' },
  { q: 'Can I download a PDF?', a: "Yes. The EMI calculator offers a PDF report of your plan, and you can save it with your browser's print dialog." },
  { q: 'How does the exam age calculator work?', a: 'It works out your age on the exam cutoff date using Indian date rules.' },
  { q: 'Can I create GST invoices?', a: 'Yes, you can create GST invoices and print or save them as PDF.' },
  { q: 'What is 3toOne?', a: '3toOne is a family of free tools — Calc, PDF, Image, Dev and more — that run in your browser.' }
];

const toolBySlug = Object.fromEntries(calcTools.map((t) => [t.slug, t]));

export const CalcHome = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return calcTools.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const favourites = FAVOURITES.map((s) => toolBySlug[s]).filter(Boolean);
  const popular = POPULAR.map((s) => toolBySlug[s]).filter(Boolean);

  return (
    <>
      <header className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{calcTools.length} calculators, built for India</span>
            <h1>
              Money and date math, <em>the Indian way.</em>
            </h1>
            <p className="hero-sub">
              EMI, GST, income tax, SIP, exam age and more. Free, fast and
              built on Indian rules.
            </p>
            <div className="hero-search">
              <input
                type="search"
                placeholder="Find calculator"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Find calculator"
              />
            </div>
            <div className="popular-chips">
              <span className="popular-label">Popular:</span>
              {popular.map((t) => (
                <Link key={t.slug} to={`/${t.slug}`} className="popular-chip">
                  {t.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="preview-card">
              <div className="preview-head">
                <span className="preview-label">QUICK EMI CHECK</span>
                <span className="preview-live">Live</span>
              </div>
              <div className="preview-body">
                <div className="preview-inputs">
                  <div className="preview-row"><span>Loan amount</span><b>Rs 25,00,000</b></div>
                  <div className="preview-row"><span>Interest rate</span><b>8.5% a year</b></div>
                  <div className="preview-row"><span>Tenure</span><b>20 years</b></div>
                </div>                  <div className="preview-result">
                    <span className="preview-label">Monthly EMI</span>
                    <strong className="preview-value"><span className="preview-rs">Rs</span>21,696</strong>
                  <div className="preview-bar"><span style={{ width: '48%' }} /></div>
                  <div className="preview-legend">
                    <span>Principal <b><span className="preview-rs">Rs</span>25,00,000</b></span>
                    <span>Interest <b><span className="preview-rs">Rs</span>27,06,939</b></span>
                  </div>
                  <span className="preview-total">Total payable: Rs 52,06,939</span>
                </div>
              </div>
              <Link to="/emi-calculator" className="preview-open">
                Open full EMI calculator <Icons.ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="shell section" id="favourites">
        <div className="section-head">
          <div>
            <span className="eyebrow">Favourites</span>
            <h2>The ones people use most</h2>
            <p className="section-lead">Start here for loans, tax, GST and investing.</p>
          </div>
        </div>
        <div className="tool-grid">
          {favourites.map((tool) => {
            const Icon = Icons[tool.icon] || Icons.Calculator;
            return (
              <Link key={tool.slug} to={`/${tool.slug}`} className="tool-card">
                <div className="tool-icon"><Icon /></div>
                <div className="tool-card-body">
                  <div className="tool-card-top">
                    <h3>{tool.title}</h3>
                    <span className="badge-live">Live</span>
                  </div>
                  <p>{tool.tagline}</p>
                  <div className="tool-card-foot">
                    {tool.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                    <span className="card-cta">Open <Icons.ArrowRight /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell section" id="calculators">
        <div className="section-head">
          <div>
            <span className="eyebrow">All calculators</span>
            <h2>Every calculator in one place</h2>
            <p className="section-lead">All {calcTools.length} calculators, ready to use</p>
          </div>
          <span className="section-count">{filtered.length} of {calcTools.length}</span>
        </div>

        <div className="calc-tabs">
          {calcCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`calc-tab ${category === cat.key ? 'on' : ''}`}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label} <span className="calc-tab-count">{cat.count}</span>
            </button>
          ))}
        </div>

        <div className="tool-grid">
          {filtered.map((tool) => {
            const Icon = Icons[tool.icon] || Icons.Calculator;
            const showNew = !NO_BADGE.has(tool.slug);
            const tint = iconTint(tool.category);
            return (
              <Link key={tool.slug} to={`/${tool.slug}`} className="tool-card">
                <div className="tool-card-top">
                  <div className={`tool-icon ${tint}`}><Icon /></div>
                  {showNew && <span className="badge-new">New</span>}
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.tagline}</p>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="muted center">No calculators match your search.</p>
        )}
      </section>

      <section className="alt-section">
        <div className="shell section">
          <span className="eyebrow">Why 3toOne Calc</span>
          <h2>Numbers you can act on</h2>
          <div className="why-grid">
            {WHY.map((card) => {
              const Icon = Icons[card.icon] || Icons.Check;
              return (
                <div className="why-card" key={card.title}>
                  <span className="why-icon green"><Icon /></span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section className="shell section faq-section" id="faq">
        <div className="section-head center">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
        </div>
        <div className="faq-list">
          {FAQS.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="faq-contact">
          Cannot find what you need? Results are estimates for planning; consult a qualified professional for final numbers.
        </p>
      </section>

      <section className="cta-band">
        <div className="shell">
          <h2>Got a number to crunch? Start in one click.</h2>
          <p>Free calculators, no sign-up. Everything runs in your browser.</p>
          <Link to="/#calculators" className="btn solid">
            Browse all calculators <Icons.ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
};

export default CalcHome;
