import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All', count: 34 },
  { id: 'data', label: 'Data and files', count: 11 },
  { id: 'code', label: 'Code and web', count: 9 },
  { id: 'seo', label: 'SEO and site', count: 14 }
];

const ICON_BY_CAT = { data: 'Braces', code: 'Code', seo: 'Bolt' };

// All 34 tools, in source order. First 11 = data, next 9 = code, last 14 = seo.
const TOOLS = [
  { name: 'JSON Formatter', desc: 'Pretty-print with error line highlighting', status: 'Free', cat: 'data' },
  { name: 'JSON Viewer', desc: 'Tree view and shareable link', status: 'Free', cat: 'data' },
  { name: 'JSON to CSV', desc: 'Handles nested data', status: 'Free', cat: 'data' },
  { name: 'XML Formatter', desc: 'Format and validate', status: 'Free', cat: 'data' },
  { name: 'CSV to Excel', desc: 'Fixes Hindi text encoding', status: 'Free', cat: 'data' },
  { name: 'Excel to CSV', desc: 'Pick the sheet to export', status: 'Free', cat: 'data' },
  { name: 'Base64 Encode/Decode', desc: 'Text and file support', status: 'Free', cat: 'data' },
  { name: 'Image to Base64', desc: 'Embed images as data URIs', status: 'Free', cat: 'data', badge: 'NEW' },
  { name: 'SQL Formatter', desc: 'Readable queries, many dialects', status: 'Free', cat: 'data', badge: 'NEW' },
  { name: 'ZIP Compressor', desc: 'Compress files in the browser', status: 'Free', cat: 'data' },
  { name: 'File Converter', desc: 'One hub linking every converter', status: 'Free', cat: 'data' },

  { name: 'HTML Minifier', desc: 'See size savings before and after', status: 'Free', cat: 'code' },
  { name: 'CSS Minifier', desc: 'See size savings before and after', status: 'Free', cat: 'code' },
  { name: 'JS Minifier', desc: 'See size savings before and after', status: 'Free', cat: 'code' },
  { name: 'URL Encoder/Decoder', desc: 'Query string helper', status: 'Free', cat: 'code' },
  { name: 'Markdown to HTML', desc: 'Live preview', status: 'Free', cat: 'code', badge: 'NEW' },
  { name: 'Color and Gradient CSS', desc: 'Copy-ready CSS', status: 'Free', cat: 'code', badge: 'NEW' },
  { name: 'Regex Tester', desc: 'Explains every match', status: 'Free', cat: 'code', badge: 'NEW' },
  { name: 'JWT Decoder', desc: 'Decoded on your device only', status: 'Free', cat: 'code', badge: 'NEW' },
  { name: 'UUID Generator', desc: 'Generate in bulk', status: 'Free', cat: 'code', badge: 'NEW' },

  { name: 'Meta Tag Generator', desc: 'Live Google, WhatsApp and Twitter preview', status: 'Free', cat: 'seo' },
  { name: 'Schema Markup Generator', desc: 'FAQ, product and local business', status: 'Free', cat: 'seo', badge: 'NEW' },
  { name: 'Open Graph Checker', desc: 'Debug social previews', status: 'Free', cat: 'seo', badge: 'NEW' },
  { name: 'Keyword Density Checker', desc: 'Compare against competitors', status: 'Free + Pro', cat: 'seo' },
  { name: 'Sitemap Generator', desc: 'Platform presets', status: 'Free', cat: 'seo' },
  { name: 'Robots.txt Generator', desc: 'Platform presets', status: 'Free', cat: 'seo' },
  { name: 'Website Speed Checker', desc: 'Score plus a step-by-step fix list', status: 'Free + Pro', cat: 'seo' },
  { name: 'Broken Link Checker', desc: 'Report export', status: 'Free + Pro', cat: 'seo' },
  { name: 'Domain Authority Checker', desc: 'Needs third-party data', status: 'Free + Pro', cat: 'seo' },
  { name: 'SSL Checker', desc: 'Expiry alerts in Pro', status: 'Free + Pro', cat: 'seo', badge: 'NEW' },
  { name: 'WHOIS Lookup', desc: 'Domain details', status: 'Free', cat: 'seo', badge: 'NEW' },
  { name: 'Redirect Checker', desc: 'See the full redirect chain', status: 'Free', cat: 'seo', badge: 'NEW' },
  { name: 'SEO Audit Report', desc: 'White-label PDF for clients', status: 'Pro', cat: 'seo', badge: 'NEW' },
  { name: 'Favicon Generator', desc: 'All sizes in one zip', status: 'Free', cat: 'seo', badge: 'NEW' }
];

const SLUG_MAP = {
  'JSON Formatter': 'json-formatter',
  'JSON Viewer': 'json-viewer',
  'JSON to CSV': 'json-to-csv',
  'XML Formatter': 'xml-formatter',
  'CSV to Excel': 'csv-to-excel',
  'Excel to CSV': 'excel-to-csv',
  'Base64 Encode/Decode': 'base64',
  'Image to Base64': 'image-to-base64',
  'SQL Formatter': 'sql-formatter',
  'ZIP Compressor': 'zip-compressor',
  'File Converter': 'file-converter',
  'HTML Minifier': 'html-minifier',
  'CSS Minifier': 'css-minifier',
  'JS Minifier': 'js-minifier',
  'URL Encoder/Decoder': 'url-encoder-decoder',
  'Markdown to HTML': 'markdown-to-html',
  'Color and Gradient CSS': 'color-gradient-css',
  'Regex Tester': 'regex-tester',
  'JWT Decoder': 'jwt-decoder',
  'UUID Generator': 'uuid-generator',
  'Meta Tag Generator': 'meta-tag-generator',
  'Schema Markup Generator': 'schema-markup-generator',
  'Open Graph Checker': 'open-graph-checker',
  'Keyword Density Checker': 'keyword-density-checker',
  'Sitemap Generator': 'sitemap-generator',
  'Robots.txt Generator': 'robots-txt-generator',
  'Website Speed Checker': 'website-speed-checker',
  'Broken Link Checker': 'broken-link-checker',
  'Domain Authority Checker': 'domain-authority-checker',
  'SSL Checker': 'ssl-checker',
  'WHOIS Lookup': 'whois-lookup',
  'Redirect Checker': 'redirect-checker',
  'SEO Audit Report': 'seo-audit-report',
  'Favicon Generator': 'favicon-generator'
};

const BLOGS = [
  { tag: 'SEO', title: 'How to read a speed report and fix the top five issues', time: '6 min read' },
  { tag: 'Data', title: 'JSON or CSV: when to convert and how', time: '4 min read' },
  { tag: 'Basics', title: 'Robots.txt and sitemaps for a brand-new website', time: '5 min read' }
];

const FAQS = [
  {
    q: 'Is 3toOneDev free?',
    a: 'Yes. Formatters, viewers, minifiers and generators are free with no sign-up. Pro adds full audits, monitoring, client reports and higher limits.'
  },
  { q: 'Is my code or data uploaded anywhere?' },
  { q: 'What do the SEO checks include?' },
  { q: 'Can I send a branded report to my client?' },
  { q: 'How accurate is the Domain Authority Checker?' },
  { q: 'Is there an API?' },
  { q: 'Can I share a result?' },
  { q: 'What is 3toOneDev?', a: '3toOneDev is a set of free developer and SEO tools that run entirely in your browser. No sign-up, nothing uploaded.' }
];

function statusClass(s) {
  if (s === 'Pro') return 'tool-status pro';
  if (s === 'Free + Pro') return 'tool-status free-pro';
  return 'tool-status free';
}

export default function DevHome() {
  const [cat, setCat] = useState('all');
  const [openFaq, setOpenFaq] = useState(0);

  const filtered = useMemo(() => {
    if (cat === 'all') return TOOLS;
    return TOOLS.filter((t) => t.cat === cat);
  }, [cat]);

  return (
    <>
      {/* HERO */}
      <section className="hero2">
        <div className="shell hero2-grid">
          <div className="hero2-left">
            <span className="hero-badge">34 developer and SEO tools</span>
            <h1 className="hero2-title">
              Developer tools that run in your <span className="hero2-accent">browser.</span>
            </h1>
            <p className="hero2-sub">
              Format JSON, minify code, check SEO and fix what the report finds. No sign-up,
              nothing to install.
            </p>
            <div className="hero2-actions">
              <a href="#tools" className="btn primary">Explore tools</a>
              <a href="#api" className="btn ghost">See the API</a>
            </div>
            <div className="hero2-term">$ paste JSON &gt; format &gt; copy</div>
          </div>

          <div className="hero2-right">
            <div className="hero-mock">
              <div className="hero-mock-head">
                <div className="hero-mock-dots">
                  <span className="dot r" />
                  <span className="dot y" />
                  <span className="dot g" />
                </div>
                <span className="hero-mock-title">json-formatter</span>
                <div className="hero-mock-btns">
                  <button type="button" className="hero-mock-btn primary">Format</button>
                  <button type="button" className="hero-mock-btn">Minify</button>
                </div>
              </div>
              <div className="hero-mock-body">
                <div className="hero-mock-section">
                  <div className="hero-mock-label">INPUT</div>
                  <pre className="hero-mock-code">{`{"name":"3toOneDev","tools":34,"free":true,"tags":["json","seo","minify"]}`}</pre>
                </div>
                <div className="hero-mock-section">
                  <div className="hero-mock-labelrow">
                    <span className="hero-mock-label">OUTPUT</span>
                    <span className="hero-mock-valid">Valid JSON</span>
                  </div>
                  <pre className="hero-mock-code hero-mock-out">{`{
    "name": "3toOneDev",
    "tools": 34,
    "free": true,
    "tags": [
        "json",
        "seo",
        "minify"
    ]
}`}</pre>
                </div>
              </div>
              <div className="hero-mock-foot">
                <span>Input 71 chars, output 106 chars</span>
                <span className="hero-mock-run">Runs in your browser</span>
              </div>
            </div>
          </div>
        </div>
        <div className="shell hero2-features">
          <span>client-side by default</span>
          <span>no sign-up</span>
          <span>shareable links</span>
          <span>API for automation</span>
        </div>
      </section>

      {/* ALL TOOLS */}
      <section id="tools" className="tools-section">
        <div className="shell">
          <h2 className="section-title">Every developer and SEO tool</h2>
          <div className="tools-meta">
            <span>{filtered.length} of 34 tools</span>
          </div>
          <div className="filter-pills">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`filter-pill ${cat === c.id ? 'active' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
          <div className="tools-grid">
            {filtered.map((t) => {
              const slug = SLUG_MAP[t.name];
              const href = slug ? `/${slug}` : '#';
              const Icon = Icons[ICON_BY_CAT[t.cat]] || Icons.Code;
              return (
                <Link to={href} key={t.name} className="tool-card">
                  <div className="tool-card-top">
                    {t.badge ? <span className="tool-badge new">NEW</span> : <span />}
                    <span className={statusClass(t.status)}>{t.status}</span>
                  </div>
                  <div className="tool-card-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="tool-card-title">{t.name}</h3>
                  <p className="tool-card-desc">{t.desc}</p>
                  <div className="tool-card-foot">
                    <span className="tool-card-cat">
                      {t.cat === 'data' ? 'Data' : t.cat === 'code' ? 'Code' : 'SEO'} ·{' '}
                      {t.name.split(' ')[0]}
                    </span>
                    <span className="tool-card-open">Open →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO AUDIT */}
      <section id="seo" className="audit-section">
        <div className="shell audit-grid">
          <div className="audit-copy">
            <h2>A score is not a fix. Get both.</h2>
            <p>
              Website Speed Checker and SEO Audit Report show what is wrong and the exact steps
              to fix it, then export a clean PDF for your client.
            </p>
            <ul className="audit-list">
              <li>Step-by-step fix list for every issue</li>
              <li>White-label PDF reports for clients</li>
              <li>History and scheduled monitoring</li>
              <li>Broken link checks up to 5,000 pages</li>
            </ul>
            <a href="#tools" className="btn primary">Try an audit free</a>
          </div>
          <div className="audit-card">
            <div className="audit-bar">
              <span>audit: example.com</span>
              <button type="button" className="audit-sample">Sample report</button>
            </div>
            <div className="audit-score">
              <div className="audit-ring">82</div>
              <div className="audit-score-sub">Good, with room to improve</div>
              <div className="audit-score-issues">3 issues found</div>
            </div>
            <div className="audit-issues">
              <div className="audit-issue high">
                <span className="pill high">HIGH</span> Large images slow the first load
              </div>
              <div className="audit-issue med">
                <span className="pill med">MED</span> Meta description missing on 4 pages
              </div>
              <div className="audit-issue low">
                <span className="pill low">LOW</span> Add alt text to 9 images
              </div>
            </div>
            <button type="button" className="audit-export">Export white-label PDF (Pro)</button>
          </div>
        </div>
      </section>

      {/* API */}
      <section id="api" className="api-section">
        <div className="shell api-grid">
          <div className="api-copy">
            <h2>Automate it with one request</h2>
            <p>
              Format JSON, convert files and run checks from your own scripts and pipelines. API
              access comes with Business.
            </p>
            <a href="#" className="btn ghost">See Business plan</a>
          </div>
          <div className="api-card">
            <div className="api-bar">request.sh</div>
            <pre className="api-code">{`curl -X POST https://api.[YOUR-DOMAIN]/v1/json/format \\
  -H "Authorization: Bearer [YOUR_API_KEY]" \\
  -d '{"json": "{\\"a\\":1}"}'`}</pre>
            <div className="api-bar">response.json</div>
            <pre className="api-code">{`"valid": true,
"formatted": "{\\n  \\"a\\": 1\\n}"`}</pre>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="why-section">
        <div className="shell">
          <h2 className="section-title center">Built for people who ship</h2>
          <div className="why-grid">
            <div className="why-card">
              <h3>Runs in your browser</h3>
              <p>Formatters and minifiers work on your device, so your code and data stay with you.</p>
            </div>
            <div className="why-card">
              <h3>Fixes, not just scores</h3>
              <p>Every SEO check comes with the steps to resolve it, ranked by impact.</p>
            </div>
            <div className="why-card">
              <h3>Shareable results</h3>
              <p>Send a link to a formatted JSON, a report or a regex test, so your team sees the same thing.</p>
            </div>
            <div className="why-card">
              <h3>Made for freelancers</h3>
              <p>Branded client reports and saved projects turn quick checks into billable work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog-section">
        <div className="shell">
          <div className="blog-head">
            <h2 className="section-title">Guides for builders</h2>
            <a href="#" className="blog-all">View all articles</a>
          </div>
          <div className="blog-grid">
            {BLOGS.map((b) => (
              <article key={b.title} className="blog-card">
                <span className="blog-tag">{b.tag}</span>
                <h3>{b.title}</h3>
                <span className="blog-time">{b.time}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-section">
        <div className="shell faq-grid">
          <div className="faq-copy">
            <h2>Questions, answered</h2>
            <p>Cannot find what you need? We reply within one working day.</p>
            <a href="#" className="btn ghost">Contact support</a>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && f.a ? <div className="faq-a">{f.a}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div className="shell cta-inner">
          <h2>Got code to clean or a site to check?</h2>
          <p>Free tools, no sign-up. Upgrade only when you need audits and reports.</p>
          <a href="#tools" className="btn dark">Browse all tools</a>
        </div>
      </section>
    </>
  );
}
