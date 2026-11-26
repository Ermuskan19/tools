import { Link, useParams } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { devTools, devToolsBySlug } from '../data/devTools';
import { JsonFormatter } from '../tools/JsonFormatter';
import { Base64Tool } from '../tools/Base64Tool';
import { JwtDecoder } from '../tools/JwtDecoder';
import GenericTool from '../tools/GenericTool';

const GENERIC = [
  'json-viewer', 'json-to-csv', 'xml-formatter', 'csv-to-excel', 'excel-to-csv',
  'image-to-base64', 'sql-formatter', 'zip-compressor', 'file-converter',
  'html-minifier', 'css-minifier', 'js-minifier', 'url-encoder-decoder',
  'markdown-to-html', 'color-gradient-css', 'regex-tester', 'uuid-generator',
  'meta-tag-generator', 'schema-markup-generator', 'open-graph-checker',
  'keyword-density-checker', 'sitemap-generator', 'robots-txt-generator',
  'website-speed-checker', 'broken-link-checker', 'domain-authority-checker',
  'ssl-checker', 'whois-lookup', 'redirect-checker', 'seo-audit-report',
  'favicon-generator'
];

const COMPONENTS = {
  'json-formatter': JsonFormatter,
  base64: Base64Tool,
  'jwt-decoder': JwtDecoder
};
GENERIC.forEach((s) => { COMPONENTS[s] = GenericTool; });

const ONE_LINERS = {
  'json-formatter': (
    <>format(input) <span className="arg">→</span> pretty <span className="arg">|</span> error <span className="str">(line, column)</span></>
  ),
  base64: (
    <>btoa(text) <span className="arg">⇄</span> atob(base64) <span className="arg">·</span> utf-8 safe</>
  ),
  'jwt-decoder': (
    <>decode(header).decode(payload) <span className="arg">·</span> <span className="str">signature not verified</span></>
  )
};

const splitTitle = (title) => {
  const at = title.lastIndexOf(' and ');
  if (at === -1) return [title, ''];
  return [title.slice(0, at), title.slice(at)];
};

const NotFound = () => (
  <section className="shell page-hero">
    <nav className="crumb">
      <Link to="/">Dev tools</Link>
      <span className="sep">/</span>
      <span>Not found</span>
    </nav>
    <h1>That tool does not exist</h1>
    <p className="hero-lead" style={{ marginTop: 12 }}>
      The link may be out of date. Every tool in this category is listed on the home page.
    </p>
    <p style={{ marginTop: 20 }}>
      <Link to="/" className="btn primary"><Icons.ArrowLeft /> All dev tools</Link>
    </p>
  </section>
);

export const DevToolPage = () => {
  const { slug } = useParams();
  const tool = devToolsBySlug[slug];
  const Tool = COMPONENTS[slug];

  if (!tool || !Tool) return <NotFound />;

  const [lead, tail] = splitTitle(tool.title);
  const related = devTools
    .filter((t) => t.slug !== tool.slug)
    .sort((a, b) => Number(b.category === tool.category) - Number(a.category === tool.category))
    .slice(0, 4);

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <nav className="crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/">Dev tools</Link>
            <span className="sep">/</span>
            <span>{tool.shortTitle}</span>
          </nav>
          <h1>
            {lead}
            {tail && <span className="em">{tail}</span>}
          </h1>
          <p className="one-liner">{ONE_LINERS[slug]}</p>
        </div>
      </section>

      <div className="shell">
        <Tool />
      </div>

      <section className="shell content-section">
        <p className="section-label">// how it works</p>
        <h2>{tool.howTitle}</h2>
        <p className="section-sub">No account, no install, nothing uploaded.</p>
        <div className="steps">
          {tool.steps.map((step, i) => (
            <div className="step" key={step.title}>
              <span className="num">0{i + 1}</span>
              <b>{step.title}</b>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell content-section">
        <h2>About this tool</h2>
        <p style={{ color: 'var(--mut)', maxWidth: 780 }}>{tool.description}</p>
      </section>

      <section className="shell content-section">
        <h2>Related tools</h2>
        <div className="related-grid">
          {related.map((other) => {
            const Icon = Icons[other.icon] || Icons.Code;
            return (
              <Link key={other.slug} to={`/${other.slug}`} className="related-card">
                <span className="card-icon"><Icon /></span>
                <span>
                  <h3>{other.shortTitle}</h3>
                  <p>{other.tagline}</p>
                </span>
                <span className="arrow"><Icons.ArrowRight /></span>
              </Link>
            );
          })}
        </div>
      </section>


    </>
  );
};

export default DevToolPage;
