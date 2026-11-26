import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { qrToolsBySlug } from '../data/qrTools';
import { QrTool } from '../tools/QrTool';
import { QrScanner } from '../tools/QrScanner';
import { BarcodeGenerator } from '../tools/BarcodeGenerator';
import { PosterMaker } from '../tools/PosterMaker';
import { DynamicQr } from '../tools/DynamicQr';
import { BulkQr } from '../tools/BulkQr';
import { LinkInBio } from '../tools/LinkInBio';
import { DigitalCard } from '../tools/DigitalCard';

const TOOL_COMPONENTS = {
  'qr-code-generator': QrTool,
  'qr-code-scanner': QrScanner,
  'barcode-generator': BarcodeGenerator,
  'wifi-qr': QrTool,
  'vcard-qr': QrTool,
  'upi-qr-generator': QrTool,
  'whatsapp-chat-qr': QrTool,
  'google-review-qr': QrTool,
  'menu-qr': QrTool,
  'qr-poster-standee-maker': PosterMaker,
  'dynamic-qr': DynamicQr,
  'bulk-qr-generator': BulkQr,
  'link-in-bio-builder': LinkInBio,
  'digital-visiting-card': DigitalCard
};

const NotFound = () => (
  <div className="shell section">
    <Link to="/" className="back-link"><Icons.ArrowLeft /> All tools</Link>
    <h1 className="notfound-title">Tool not found</h1>
    <p className="muted">The tool you are looking for does not exist.</p>
  </div>
);

export const QrToolPage = () => {
  const { slug } = useParams();
  const tool = qrToolsBySlug[slug];
  const Component = TOOL_COMPONENTS[slug];

  if (!tool || !Component) return <NotFound />;

  return (
    <>
      <header className="tool-hero">
        <div className="shell">
          <Link to="/" className="back-link"><Icons.ArrowLeft /> All tools</Link>
          <h1>{tool.title}</h1>
          <p className="tool-sub">{tool.description}</p>
          <div className="hero-chips center">
            <span className="chip">Free, no sign-up</span>
            <span className="chip">Live preview</span>
            <span className="chip">Nothing leaves your browser</span>
          </div>
        </div>
      </header>

      <div className="shell">
        <Component title={tool.title} description={tool.description} slug={slug} />

        {tool.faqs && (
          <section className="landing-section">
            <div className="landing-block">
              <h2>Frequently asked questions</h2>
              <div className="faq-list inline">
                {tool.faqs.map((faq) => (
                  <details key={faq.q}>
                    <summary>{faq.q}</summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="landing-block">
              <h2>How it works</h2>
              <ol className="landing-steps">
                {tool.steps.map((step, index) => (
                  <li key={index}>
                    <span className="step-num">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="privacy-note">
              <Icons.Check /> 100% private — this tool runs entirely in your
              browser. Your data never leaves your device.
            </p>
          </section>
        )}
      </div>
    </>
  );
};

export default QrToolPage;
