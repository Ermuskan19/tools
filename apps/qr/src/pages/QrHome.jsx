import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { qrTools, qrCategories } from '../data/qrTools';

const TRUST = [
  { label: 'Free static QR codes' },
  { label: 'No sign-up for basic tools' },
  { label: 'Runs in your browser' },
  { label: 'Print-ready exports' }
];

const FAVOURITES = ['upi-qr-generator', 'menu-qr', 'google-review-qr', 'whatsapp-chat-qr'];

const POPULAR = ['upi-qr-generator', 'menu-qr', 'google-review-qr', 'whatsapp-chat-qr', 'dynamic-qr'];

const WHY = [
  { icon: 'Check', title: 'Built for Indian shops', body: 'UPI, menus, Google reviews and WhatsApp chats — QR types Indian businesses actually use.' },
  { icon: 'ArrowRight', title: 'Edit and re-download', body: 'Keep QR records in one place, change a destination and download the updated code.' },
  { icon: 'Receipt', title: 'Print-ready posters', body: 'Scan to Pay and menu layouts sized for your counter, ready to print or save as PNG.' },
  { icon: 'Compare', title: 'Local QR library', body: 'Name, edit and delete your saved QR codes. Everything stays in this browser.' }
];

const FAQS = [
  { q: 'What is the difference between static and dynamic QR?', a: 'A static QR stores your link or details directly and never changes. This free dynamic tool keeps a QR library on your device so you can edit a destination and download a fresh code. An already-printed code only changes through a hosted redirect service.' },
  { q: 'Do static QR codes expire?', a: 'No. Static QR codes work forever and are never locked behind a paywall.' },
  { q: 'Will my UPI QR work with all payment apps?', a: 'UPI QR codes follow the standard UPI format, so they are designed to work with UPI apps. Test with a small payment before you print.' },
  { q: 'Can I add my logo and brand colours?', a: 'You can pick the QR colour and download PNG or SVG for free. Logo upload is not available.' },
  { q: 'Can I print a poster or standee?', a: 'Yes. The poster and standee maker creates Scan to Pay and menu layouts in print-ready sizes.' },
  { q: 'Can I create many QR codes at once?', a: 'Yes — the bulk generator handles up to 50 values and downloads them as a ZIP of PNGs.' },
  { q: 'What is 3toOne?', a: '3toOne is a family of free tools — Calc, PDF, Image, Dev and more — that run in your browser.' }
];

const qrPath = (seed) => {
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const N = 25; let x = hash(seed) || 1;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  const eye = (a, b) => a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4);
  let d = '';
  for (let y = 0; y < N; y++) for (let c = 0; c < N; c++) {
    let on;
    const inEye = (c < 8 && y < 8) || (c >= N - 8 && y < 8) || (c < 8 && y >= N - 8);
    if (inEye) { const ox = c < 8 ? 0 : N - 7, oy = y < 8 ? 0 : N - 7, a = c - ox, b = y - oy; on = (a < 0 || a > 6 || b < 0 || b > 6) ? false : eye(a, b); }
    else if (y === 6) on = c % 2 === 0;
    else if (c === 6) on = y % 2 === 0;
    else if (c >= 16 && c <= 20 && y >= 16 && y <= 20) { const a = c - 16, b = y - 16; on = a === 0 || a === 4 || b === 0 || b === 4 || (a === 2 && b === 2); }
    else on = rnd() > 0.52;
    if (on) d += 'M' + c + ' ' + y + 'h1v1h-1z';
  }
  return d;
};

const toolBySlug = Object.fromEntries(qrTools.map((t) => [t.slug, t]));

export const QrHome = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [demoTab, setDemoTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [shopName, setShopName] = useState('');
  const [amount, setAmount] = useState('');
  const [demoText, setDemoText] = useState('');
  const [qrColor, setQrColor] = useState('#0F766E');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return qrTools.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const favourites = FAVOURITES.map((s) => toolBySlug[s]).filter(Boolean);
  const popular = POPULAR.map((s) => toolBySlug[s]).filter(Boolean);

  const DEMO_TABS = [
    { key: 'upi', label: 'UPI payment', title: 'UPI payment QR' },
    { key: 'whatsapp', label: 'WhatsApp chat', title: 'WhatsApp chat QR' },
    { key: 'review', label: 'Google review', title: 'Google review QR' },
    { key: 'link', label: 'Website link', title: 'Website link QR' },
    { key: 'wifi', label: 'Wi-Fi', title: 'Wi-Fi QR' },
    { key: 'menu', label: 'Menu', title: 'Menu QR' },
  ];
  const demoTabObj = DEMO_TABS.find((t) => t.key === demoTab) || DEMO_TABS[0];
  const demoPayload = () => {
    if (demoTab === 'upi') return `upi://pay?pa=${upiId}&pn=${shopName}&am=${amount}`;
    if (demoTab === 'wifi') return `WIFI:T:WPA;S:${demoText};P:password;;`;
    return demoText || demoTabObj.title;
  };

  return (
    <>
      <header className="home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">14 QR tools, made for Indian shops</span>
            <h1>
              QR codes your<br />customers will<br />actually scan.
            </h1>
            <p className="hero-sub">
              UPI payments, menus, Google reviews and WhatsApp chats.<br />
              Create in seconds, print-ready, free to start.
            </p>
            <div className="hero-actions">
              <Link to="/upi-qr-generator" className="btn solid">Make a QR code</Link>
              <a href="#tools" className="btn outline">See dynamic QR</a>
            </div>
            <div className="hero-features">
              <span><i className="hero-check">✓</i> Static QR never expires</span>
              <span><i className="hero-check">✓</i> Works with UPI apps</span>
              <span><i className="hero-check">✓</i> Print-ready posters</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-cards">
              <div className="hero-card-back" />
              <div className="hero-card-front">
                <div className="hero-card-banner">SCAN TO PAY</div>
                <div className="hero-qr">
                  <svg viewBox="0 0 25 25" width="150" height="150" shapeRendering="crispEdges">
                    <path d={qrPath('upi|zegqr-demo')} fill="#0F766E" />
                  </svg>
                </div>
                <div className="hero-card-name">[YOUR SHOP NAME]</div>
                <div className="hero-card-sub">Pay with any UPI app</div>
              </div>
              <span className="hero-float hero-float-left">Static QR: free forever</span>
              <span className="hero-float hero-float-right">Dynamic QR: edit anytime</span>
            </div>
          </div>
        </div>
      </header>

      <section className="shell section three-steps" id="three-steps">
        <div className="section-head center">
          <h2>Make your QR in three steps</h2>
          <p className="section-lead">Pick a type, fill in the details and style it. Preview updates as you type.</p>
        </div>
        <div className="three-card">
          <div className="tab-bar">
            {DEMO_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tab-pill ${demoTab === t.key ? 'on' : ''}`}
                onClick={() => setDemoTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="three-grid">
            <div className="three-left">
              <span className="step-label">1. ADD DETAILS</span>
              <h3 className="step-title">{demoTabObj.title}</h3>
              {demoTab === 'upi' && (
                <>
                  <label className="field-label">UPI ID</label>
                  <input className="field-input" placeholder="yourshop@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  <label className="field-label">Shop name</label>
                  <input className="field-input" placeholder="Your shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                  <label className="field-label">Amount in Rs (optional)</label>
                  <input className="field-input" placeholder="For example 250" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </>
              )}
              {demoTab !== 'upi' && (
                <>
                  <label className="field-label">Content</label>
                  <input className="field-input" placeholder={demoTabObj.title} value={demoText} onChange={(e) => setDemoText(e.target.value)} />
                </>
              )}
              <span className="step-label step-label-2">2. PICK A STYLE</span>
              <div className="color-row">
                {['#0F766E', '#116A5B', '#c64511', '#1f2937', '#7c3aed'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-dot ${qrColor === c ? 'on' : ''}`}
                    style={{ background: c }}
                    onClick={() => setQrColor(c)}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <div className="three-right">
              <span className="step-label">3. PREVIEW AND DOWNLOAD</span>
              <div className="preview-qr-card">
                <svg viewBox="0 0 25 25" width="170" height="170" shapeRendering="crispEdges">
                  <path d={qrPath(demoPayload())} fill={qrColor} />
                </svg>
                <button className="scan-pill" type="button">Scan to pay</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell section" id="favourites">
        <div className="section-head">
          <div>
            <span className="eyebrow">Favourites</span>
            <h2>The ones shops use most</h2>
            <p className="section-lead">Start here for payments, menus and reviews.</p>
          </div>
        </div>
        <div className="tool-grid">
          {favourites.map((tool) => {
            const Icon = Icons.Qr;
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
                    <span className="card-cta">Open <Icons.ArrowRight /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell section" id="tools">
        <div className="section-head">
          <div>
            <span className="eyebrow">All tools</span>
            <h2>Every QR tool in one place</h2>
            <p className="section-lead">All {qrTools.length} tools, ready to use</p>
          </div>
          <span className="section-count">{filtered.length} of {qrTools.length}</span>
        </div>

        <div className="calc-tabs">
          {qrCategories.map((cat) => (
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
          {filtered.map((tool) => (
            <Link key={tool.slug} to={`/${tool.slug}`} className="tool-card">
              <div className="tool-card-top">
                <div className="tool-icon teal"><Icons.Qr /></div>
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.tagline}</p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="muted center">No tools match your search.</p>
        )}
      </section>

      <section className="alt-section">
        <div className="shell section">
          <span className="eyebrow">Why 3toOne Qr</span>
          <h2>QR codes your counter can trust</h2>
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
      </section>

      <section className="shell section dynamic-promo">
        <div className="dynamic-grid">
          <div className="dynamic-copy">
            <span className="eyebrow orange">DYNAMIC QR</span>
            <h2>Keep your QR codes in one place.</h2>
            <p className="section-lead">Menus change, offers end, links break. Save a QR, edit its destination whenever it changes, and download the updated code.</p>
            <ul className="check-list">
              <li><i className="hero-check">✓</i> Save and name each QR</li>
              <li><i className="hero-check">✓</i> Edit a destination whenever it changes</li>
              <li><i className="hero-check">✓</i> Download the updated PNG or SVG</li>
              <li><i className="hero-check">✓</i> Delete codes you no longer need</li>
            </ul>
            <Link to="/dynamic-qr" className="btn solid orange-btn">Try dynamic QR free</Link>
          </div>
          <div className="dynamic-card">
            <span className="sample-badge">Your library</span>
            <div className="dc-title">Shop menu QR</div>
            <div className="dc-metrics">
              <div className="dc-metric"><span>Saved codes</span><b>1</b></div>
              <div className="dc-metric"><span>Stored</span><b>This browser</b></div>
              <div className="dc-metric"><span>Download</span><b>PNG / SVG</b></div>
            </div>
            <div className="dc-foot">
              <span>Destination: yourshop.com/menu</span>
              <span className="dc-edit">Editable</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <h2>Ready to put a QR on your counter?</h2>
          <p>Free static QR codes, no sign-up. Build, edit and download in your browser.</p>
          <Link to="/#tools" className="btn solid">
            Browse all QR tools <Icons.ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
};

export default QrHome;
