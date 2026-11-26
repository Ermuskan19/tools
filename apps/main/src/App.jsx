import { Fragment, useState, useEffect, useSyncExternalStore } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Icons } from './components/Icons';
import { ToolLanding } from './components/ToolLanding';
import { ToolCard, ScrollToTop } from '@zegnite/shared-ui';
import { PdfMerger, PdfSplitter, PdfCompressor, PdfToWord, WordToPdf } from '@zegnite/pdf-tools';
import { toolsData, toolsBySlug } from './data/tools';
import { PDF_SITE_URL, CALC_SITE_URL, DEV_SITE_URL, IMG_SITE_URL, QR_SITE_URL, SOCIAL_SITE_URL } from './config/site';
import './App.css';

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
        {DEV_SITE_URL ? (
          <a href={DEV_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">Dev Tools</a>
        ) : (
          <Link to="/" className={`nav-link ${isActive('/dev-tools') ? 'active' : ''}`}>Dev Tools</Link>
        )}
        <Link to="/tools/exam-doc-resizer" className={`nav-link ${isActive('/tools/exam-doc-resizer') ? 'active' : ''}`}>Exam Specific</Link>
        {PDF_SITE_URL && (
          <a href={PDF_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">PDF Tools</a>
        )}
        {CALC_SITE_URL && (
          <a href={CALC_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">Calculators</a>
        )}
        {IMG_SITE_URL && (
          <a href={IMG_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">Image Tools</a>
        )}
        {QR_SITE_URL && (
          <a href={QR_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">QR Tools</a>
        )}
        {SOCIAL_SITE_URL && (
          <a href={SOCIAL_SITE_URL} className="nav-link" target="_blank" rel="noopener noreferrer">Social Tools</a>
        )}
      </div>
      <span className="nav-tagline"> nothing leaves your browser</span>
    </nav>
  );
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
        <div className="footer-col">
          <h4>Products</h4>
          <ul>
            {PDF_SITE_URL && <li><a href={PDF_SITE_URL} target="_blank" rel="noopener noreferrer">PDF Tools</a></li>}
            {CALC_SITE_URL && <li><a href={CALC_SITE_URL} target="_blank" rel="noopener noreferrer">Calculators</a></li>}
            {DEV_SITE_URL && <li><a href={DEV_SITE_URL} target="_blank" rel="noopener noreferrer">Dev Tools</a></li>}
            {IMG_SITE_URL && <li><a href={IMG_SITE_URL} target="_blank" rel="noopener noreferrer">Image Tools</a></li>}
            {QR_SITE_URL && <li><a href={QR_SITE_URL} target="_blank" rel="noopener noreferrer">QR Tools</a></li>}
            {SOCIAL_SITE_URL && <li><a href={SOCIAL_SITE_URL} target="_blank" rel="noopener noreferrer">Social Tools</a></li>}
          </ul>
        </div>
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

// Home-only closing CTA, rendered just above the footer.
const CTA_CATEGORIES = [
  { key: 'docs', label: 'Documents', icon: 'Pdf' },
  { key: 'media', label: 'Media & images', icon: 'Image' },
  { key: 'text', label: 'Text tools', icon: 'Text' },
  { key: 'dev', label: 'Dev tools', icon: 'Code' },
  { key: 'calc', label: 'Calculators', icon: 'Calculator' },
  { key: 'security', label: 'Security', icon: 'Lock' },
  { key: 'design', label: 'Design', icon: 'Type' }
];

const CtaSection = () => {
  const scrollToTools = () => {
    document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="cta-section" aria-labelledby="cta-title">
      <div className="cta-tiles" aria-hidden="true">
        {CTA_CATEGORIES.map((cat) => {
          const Icon = Icons[cat.icon];
          return (
            <span key={cat.key} className={`cta-tile cta-tile-${cat.key}`}>
              <Icon />
            </span>
          );
        })}
      </div>
      <h2 id="cta-title" className="cta-title">Find the tool you need, today.</h2>
      <p className="cta-sub">Free to use. Every tool runs in your browser — no uploads, no sign-ups.</p>
      <div className="cta-actions">
        <button type="button" className="cta-btn cta-btn-primary" onClick={scrollToTools}>
          Browse all tools
        </button>
        {PDF_SITE_URL ? (
          <a href={PDF_SITE_URL} className="cta-btn cta-btn-ghost" target="_blank" rel="noopener noreferrer">
            Explore PDF tools
          </a>
        ) : (
          <Link to="/tools/pdf-merger" className="cta-btn cta-btn-ghost">Explore PDF tools</Link>
        )}
      </div>
    </section>
  );
};

// Home-only "Better together" section: a job picker showing how tools chain.
const TOGETHER_JOBS = [
  {
    id: 'apply',
    title: 'Apply for a job or exam',
    desc: "Photos, signature and certificates inside the portal's limits.",
    steps: [
      { tool: 'Exam Doc Resizer', slug: 'exam-doc-resizer', brand: '3toOne PDF', tone: '#be123c', icon: 'Pdf', text: 'Resize the photo and signature to the exact exam spec.' },
      { tool: 'PDF Merger', slug: 'pdf-merger', brand: '3toOne PDF', tone: '#be123c', icon: 'Pdf', text: 'Merge the certificates, ID proof and resume into one PDF.' },
      { tool: 'PDF Compressor', slug: 'pdf-compressor', brand: '3toOne PDF', tone: '#be123c', icon: 'Pdf', text: "Bring the merged file under the portal's upload limit." }
    ],
    result: 'One upload-ready PDF, photo to signature, within the size cap.'
  },
  {
    id: 'product-photo',
    title: 'Publish a product photo',
    desc: 'Clean cutout, right dimensions, a file that loads fast.',
    steps: [
      { tool: 'Background Remover', slug: 'background-remover', brand: '3toOne Image', tone: '#2563eb', icon: 'Image', text: 'Cut the product out of its background on your device.' },
      { tool: 'Image Resizer', slug: 'image-resizer', brand: '3toOne Image', tone: '#2563eb', icon: 'Image', text: 'Fit it to the exact dimensions your storefront needs.' },
      { tool: 'Image Optimizer', slug: 'image-optimizer', brand: '3toOne Image', tone: '#2563eb', icon: 'Image', text: 'Compress it to a weight that keeps the page fast.' }
    ],
    result: 'A sharp, transparent product shot that loads in a blink.'
  },
  {
    id: 'publish-page',
    title: 'Write and ship a page',
    desc: 'Copy, keyword check and meta tags in a single pass.',
    steps: [
      { tool: 'Word & Character Counter', slug: 'word-counter', brand: '3toOne Text', tone: '#15803d', icon: 'Text', text: 'Keep the copy inside the length the layout allows.' },
      { tool: 'Keyword Density Checker', slug: 'keyword-density-checker', brand: '3toOne Text', tone: '#15803d', icon: 'Text', text: 'Check the main keyword reads naturally, not stuffed.' },
      { tool: 'Meta Tag Generator', slug: 'meta-tag-generator', brand: '3toOne Dev', tone: '#4f46e5', icon: 'Code', text: 'Generate the title, description and Open Graph tags.' }
    ],
    result: 'A page that is ready to publish and easy to find.'
  },
  {
    id: 'invoice',
    title: 'Invoice a client',
    desc: 'From GST maths to a signed PDF with a payment QR.',
    steps: [
      { tool: 'GST Calculator', slug: 'gst-calculator', brand: '3toOne Calc', tone: '#15803d', icon: 'Calculator', text: 'Work out the GST and the exact total to bill.' },
      { tool: 'QR Code Generator', slug: 'qr-code-generator', brand: '3toOne QR', tone: '#4f46e5', icon: 'Qr', text: 'Create a payment QR that opens your UPI app.' },
      { tool: 'PDF Merger', slug: 'pdf-merger', brand: '3toOne PDF', tone: '#be123c', icon: 'Pdf', text: 'Attach the QR to the invoice and export one PDF.' }
    ],
    result: 'A client-ready invoice PDF with tax worked out and a payment QR.'
  }
];

const BetterTogetherSection = () => {
  const [activeJob, setActiveJob] = useState(0);
  const job = TOGETHER_JOBS[activeJob];

  return (
    <section className="bt-section" aria-labelledby="bt-title">
      <div className="bt-inner">
        <div className="bt-header">
          <span className="bt-eyebrow">
            <span className="bt-eyebrow-icon" aria-hidden="true"><Icons.ChainLink /></span>
            Better together
          </span>
          <h2 id="bt-title" className="bt-title">One job, several products, no starting over</h2>
          <p className="bt-sub">
            Pick a job and follow your work from one tool to the next — same file,
            same browser tab, no re-uploading.
          </p>
        </div>

        <div className="bt-layout">
          <div className="bt-jobs" role="group" aria-label="Choose a job">
            {TOGETHER_JOBS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`bt-job ${i === activeJob ? 'active' : ''}`}
                aria-pressed={i === activeJob}
                onClick={() => setActiveJob(i)}
              >
                <span className="bt-job-title">{item.title}</span>
                <span className="bt-job-desc">{item.desc}</span>
              </button>
            ))}
          </div>

          <div className="bt-panel">
            <div className="bt-panel-head">
              <h3>{job.title}</h3>
              <span className="bt-steps-count">{job.steps.length} steps</span>
            </div>

            <div className="bt-steps">
              {job.steps.map((step, i) => {
                const StepIcon = Icons[step.icon];
                return (
                  <Fragment key={step.slug}>
                    <Link
                      to={`/tools/${step.slug}`}
                      className="bt-step"
                      style={{ '--tone': step.tone }}
                    >
                      <span className="bt-step-head">
                        <span className="bt-step-icon" aria-hidden="true"><StepIcon /></span>
                        <span className="bt-step-brand">
                          <strong>{step.brand}</strong>
                          <span>Step {i + 1}</span>
                        </span>
                      </span>
                      <span className="bt-step-tool">{step.tool}</span>
                      <span className="bt-step-text">{step.text}</span>
                    </Link>
                    <span className="bt-arrow" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </Fragment>
                );
              })}
            </div>

            <div className="bt-result">
              <span className="bt-result-icon" aria-hidden="true"><Icons.Check /></span>
              <span className="bt-result-label">Result</span>
              <p className="bt-result-text">{job.result}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Home-only product overview: one tinted card per tool family, after the hero.
const PRODUCT_FAMILIES = [
  {
    key: 'docs',
    name: '3toOne PDF',
    icon: 'Pdf',
    tone: '#c8102e',
    tint: '#fff1f3',
    edge: '#f4c3cc',
    ink: '#4a2a30',
    muted: '#6b4048',
    wide: true,
    hero: true,
    desc: 'Every PDF job, done in seconds. Merge, compress, convert and fix — including exam-ready documents.',
    chips: ['Merge PDF', 'Compress PDF', 'PDF to Word', 'Exam Doc Resizer'],
    note: '34 on the PDF site',
    cta: 'Browse PDF tools'
  },
  {
    key: 'media',
    name: '3toOne Image',
    icon: 'Image',
    tone: '#2563eb',
    tint: '#eaf2ff',
    edge: '#bcd3f8',
    ink: '#1f3560',
    muted: '#385178',
    hero: true,
    skip: ['qr-code-generator'],
    desc: 'Photos that pass every form. Exact-size compression, exam presets and clean cutouts.',
    chips: ['Image Optimizer', 'Image Resizer', 'Background Remover', 'JPG to PNG'],
    cta: 'Browse image tools'
  },
  {
    key: 'calc',
    name: '3toOne Calc',
    icon: 'Calculator',
    tone: '#047857',
    tint: '#e9f8f0',
    edge: '#b5e3cb',
    ink: '#1f4034',
    muted: '#2f5a47',
    desc: 'Money and date math, the Indian way. EMI, GST and loan totals in one tap.',
    chips: ['EMI Calculator', 'GST Calculator'],
    cta: 'Open calculators'
  },
  {
    id: 'qr',
    key: 'qr',
    name: '3toOne QR',
    icon: 'Qr',
    tone: '#0f766e',
    tint: '#e3f6f2',
    edge: '#b9e5da',
    ink: '#123f38',
    muted: '#2f6459',
    slugs: ['qr-code-generator'],
    desc: 'Scan-ready codes for links, WiFi and contact cards — generated in your browser, never expiring.',
    chips: ['QR Code Generator'],
    cta: 'Open QR generator',
    to: '/tools/qr-code-generator'
  },
  {
    id: 'media',
    key: 'media',
    name: '3toOne Media',
    icon: 'Image',
    art: 'gallery',
    tone: '#c2410c',
    tint: '#fff0e4',
    edge: '#f4d3b8',
    ink: '#4a2a10',
    muted: '#7a4a26',
    desc: 'Photos, conversions and QR codes in one place — every file processed on your device.',
    chips: ['Image Optimizer', 'Image Converter', 'QR Code Generator'],
    cta: 'Browse media tools'
  },
  {
    id: 'dev',
    key: 'dev',
    name: '3toOne Dev',
    icon: 'Code',
    variant: 'dark',
    tone: '#a3e635',
    on: '#0f172a',
    tint: '#0e0e13',
    edge: '#0e0e13',
    ink: '#ffffff',
    muted: '#9ca3af',
    desc: 'Developer and SEO tools that run in your browser.',
    cta: 'Browse dev tools'
  },
  {
    id: 'social',
    key: 'text',
    name: '3toOne Social',
    icon: 'Hash',
    variant: 'social',
    tone: '#c2185b',
    tint: '#fce7f1',
    edge: '#fce7f1',
    ink: '#1b1720',
    muted: '#6b5563',
    slugs: ['hashtag-generator', 'youtube-title-generator', 'bio-generator'],
    desc: 'Grow faster on Instagram and YouTube. Hashtags, titles and bios that fit.',
    panelLine: 'Hashtags, titles and bios — ready for your next post.',
    tags: ['#instagram', '#youtube'],
    cta: 'Browse social tools'
  }
];

const familyToolCount = (family) => {
  if (family.slugs) {
    return toolsData.filter((tool) => family.slugs.includes(tool.slug)).length;
  }
  return toolsData.filter(
    (tool) => tool.category === family.key && !(family.skip || []).includes(tool.slug)
  ).length;
};

const FamilyArt = ({ kind }) => {
  if (kind === 'docs') {
    return (
      <div className="pf-art-docs">
        <span className="pf-sheet pf-sheet-back" />
        <span className="pf-sheet pf-sheet-mid" />
        <span className="pf-sheet pf-sheet-front">
          <i className="pf-line pf-line-1" />
          <i className="pf-line pf-line-2" />
          <i className="pf-line pf-line-3" />
          <span className="pf-badge">8.4 MB → 184 KB</span>
        </span>
      </div>
    );
  }

  if (kind === 'media') {
    return (
      <div className="pf-art-media">
        <span className="pf-photo pf-photo-before" />
        <span className="pf-media-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        <span className="pf-photo pf-photo-after">42 KB</span>
      </div>
    );
  }

  if (kind === 'calc') {
    return (
      <div className="pf-tile">
        <span className="pf-tile-label">Monthly EMI (sample)</span>
        <strong className="pf-tile-value">₹21,696</strong>
        <span className="pf-meter"><i style={{ width: '42%' }} /></span>
      </div>
    );
  }

  if (kind === 'qr') {
    return (
      <div className="pf-qr">
        <span className="pf-qr-eye pf-qr-eye-a" />
        <span className="pf-qr-eye pf-qr-eye-b" />
        <span className="pf-qr-eye pf-qr-eye-c" />
      </div>
    );
  }

  return (
    <div className="pf-art-gallery">
      <span className="pf-shot pf-shot-a" />
      <span className="pf-shot pf-shot-b" />
      <span className="pf-shot pf-shot-c" />
    </div>
  );
};

const ProductFamiliesSection = ({ onBrowseCategory }) => (
  <section className="pf-section" aria-labelledby="pf-title">
    <div className="pf-head">
      <span className="pf-eyebrow">Our products</span>
      <h2 id="pf-title" className="pf-title">Seven tool families, each built for one kind of job</h2>
      <p className="pf-sub">
        Every family has its own tools and its own look, and they all live in one place.
        No sign-ups, no uploads — everything runs in your browser.
      </p>
    </div>

    <div className="pf-grid">
      {PRODUCT_FAMILIES.map((family) => {
        const FamilyIcon = Icons[family.icon];
        return (
          <article
            key={family.id || family.key}
            className={`pf-card${family.wide ? ' pf-card-wide' : ''}${family.hero ? ' pf-card-hero' : ''}${family.variant ? ` pf-card-${family.variant}` : ''}`}
            style={{
              '--pf-tone': family.tone,
              '--pf-on': family.on || '#fff',
              '--pf-tint': family.tint,
              '--pf-edge': family.edge,
              '--pf-ink': family.ink,
              '--pf-muted': family.muted
            }}
          >
            <div className="pf-brand">
              <span className="pf-logo" aria-hidden="true"><FamilyIcon /></span>
              <div className="pf-brand-text">
                <h3>{family.name}</h3>
                <span className="pf-count">
                  {familyToolCount(family)} tool{familyToolCount(family) === 1 ? '' : 's'}
                  {family.note ? ` · ${family.note}` : ''}
                </span>
              </div>
            </div>

            <p className="pf-desc">{family.desc}</p>

            {family.variant === 'dark' && (
              <div className="pf-dark-panel" aria-hidden="true">
                <span className="pf-code-line">{'{'}</span>
                <span className="pf-code-line pf-code-indent">
                  <span className="pf-code-key">"tool"</span>: <span className="pf-code-str">"json-formatter"</span>,
                </span>
                <span className="pf-code-line pf-code-indent">
                  <span className="pf-code-key">"valid"</span>: <span className="pf-code-num">true</span>,
                </span>
                <span className="pf-code-line pf-code-indent">
                  <span className="pf-code-key">"runs_in"</span>: <span className="pf-code-str">"your browser"</span>
                </span>
                <span className="pf-code-line">{'}'}</span>
              </div>
            )}

            {family.variant === 'social' && (
              <div className="pf-social-panel">
                <p className="pf-social-line">{family.panelLine}</p>
                <div className="pf-social-tags" aria-hidden="true">
                  {family.tags.map((tag) => (
                    <span key={tag} className="pf-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {!family.variant && (
              <>
                <div className="pf-art" aria-hidden="true">
                  <FamilyArt kind={family.art || family.key} />
                </div>

                <div className="pf-chips">
                  {family.chips.map((chip) => (
                    <span key={chip} className="pf-chip">{chip}</span>
                  ))}
                </div>
              </>
            )}

            <div className="pf-actions">
              {(() => {
                const siteUrl =
                  family.key === 'docs' ? PDF_SITE_URL :
                  family.key === 'media' ? IMG_SITE_URL :
                  family.key === 'calc' ? CALC_SITE_URL :
                  family.key === 'qr' ? QR_SITE_URL :
                  family.key === 'dev' ? DEV_SITE_URL :
                  family.key === 'text' ? SOCIAL_SITE_URL :
                  '';
                if (siteUrl) {
                  return (
                    <a className="pf-cta" href={siteUrl} target="_blank" rel="noopener noreferrer">
                      {family.cta}
                    </a>
                  );
                }
                if (family.to) {
                  return <Link className="pf-cta" to={family.to}>{family.cta}</Link>;
                }
                if (family.key === 'docs') {
                  return <Link className="pf-cta" to="/tools/pdf-merger">{family.cta}</Link>;
                }
                return (
                  <button
                    type="button"
                    className="pf-cta"
                    onClick={() => onBrowseCategory(family.key)}
                  >
                    {family.cta}
                  </button>
                );
              })()}
            </div>
          </article>
        );
      })}
    </div>
  </section>
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
          <ToolCard key={tool.id} tool={tool} href={`/tools/${tool.slug}`} />
        ))}
      </div>
    </div>
  );
};

const PDF_CATEGORIES = [
  { key: 'convert', label: 'Convert PDF', slug: 'convert' },
  { key: 'organize', label: 'Organize PDF', slug: 'organize' },
  { key: 'optimize', label: 'Optimize PDF', slug: 'optimize' },
  { key: 'edit-sign', label: 'Edit & Sign', slug: 'edit-sign' },
  { key: 'security', label: 'Security', slug: 'security' },
  { key: 'india', label: 'Made for India', slug: 'india' }
];

const POPULAR_PDF_SLUGS = ['pdf-merger', 'pdf-compressor', 'pdf-to-word'];

const pdfLink = (slug) => (PDF_SITE_URL ? `${PDF_SITE_URL}/${slug}` : `/tools/${slug}`);

const PdfSection = () => {
  const popular = toolsData.filter((t) => POPULAR_PDF_SLUGS.includes(t.slug));
  return (
    <div className="container pdf-section">
      <div className="section-header">
        <h2 className="section-title">PDF Tools</h2>
        {PDF_SITE_URL && (
          <a
            href={PDF_SITE_URL}
            className="view-all external"
            target="_blank"
            rel="noopener noreferrer"
          >
            View all PDF tools on 3toOne PDF
          </a>
        )}
      </div>
      <div className="tool-grid">
        {popular.map((tool) => (
          <ToolCard key={tool.id} tool={tool} href={pdfLink(tool.slug)} />
        ))}
      </div>
      <div className="pdf-category-tiles">
        {PDF_CATEGORIES.map((cat) => {
          const href = PDF_SITE_URL ? `${PDF_SITE_URL}#${cat.slug}` : '#';
          return (
            <a
              key={cat.key}
              href={href}
              className={`pdf-tile${PDF_SITE_URL ? '' : ' disabled'}`}
              target={PDF_SITE_URL ? '_blank' : undefined}
              rel={PDF_SITE_URL ? 'noopener noreferrer' : undefined}
            >
              {cat.label}
            </a>
          );
        })}
      </div>
    </div>
  );
};

const Home = ({ searchQuery, setSearchQuery, activeCategory, setActiveCategory, recentlyUsed }) => {
  const browseCategory = (key) => {
    setActiveCategory(key);
    requestAnimationFrame(() => {
      document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const recentSlugs = recentlyUsed || [];
  const recentTools = recentSlugs.map(s => toolsBySlug[s]).filter(Boolean);
  const filteredTools = toolsData
    .filter(tool =>
      tool.group !== 'pdf' &&
      (activeCategory === 'all' || tool.category === activeCategory) &&
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => Number(b.popular) - Number(a.popular));

  return (
    <>
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductFamiliesSection onBrowseCategory={browseCategory} />
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
      <PdfSection />
      <div className="container" id="all-tools">
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
      const stored = localStorage.getItem('3toone-recent');
      let recent = stored ? JSON.parse(stored) : [];
      recent = [slug, ...recent.filter(s => s !== slug)].slice(0, 6);
      localStorage.setItem('3toone-recent', JSON.stringify(recent));
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
  try { raw = localStorage.getItem('3toone-recent') || '[]'; } catch { /* private mode */ }
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
  const { pathname } = useLocation();
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

      {pathname === '/' && <BetterTogetherSection />}
      {pathname === '/' && <CtaSection />}

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
