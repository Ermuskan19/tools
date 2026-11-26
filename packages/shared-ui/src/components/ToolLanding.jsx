import { Link } from 'react-router-dom';
import { Icons } from './Icons';

// Landing content rendered under every tool: how-it-works steps,
// FAQ (also emitted as JSON-LD by the prerender build), related tools
// and the privacy note. `related` is passed by the owning app so the
// registry stays app-specific.
export const ToolLanding = ({ tool, related = [] }) => {
  if (!tool || !tool.steps?.length) return null;

  return (
    <section className="tool-landing">
      <div className="landing-block">
        <h2 className="landing-title">How it works</h2>
        <ol className="landing-steps">
          {tool.steps.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {tool.faqs?.length > 0 && (
        <div className="landing-block">
          <h2 className="landing-title">Frequently asked questions</h2>
          <dl className="landing-faq">
            {tool.faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="landing-block">
        <h2 className="landing-title">Related tools</h2>
        <div className="related-row">
          {related.map(t => {
            const Icon = Icons[t.icon];
            return (
              <Link key={t.slug} to={t.href} className="related-chip">
                <Icon /> {t.title}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="privacy-note">
        100% private — like every tool on 3toOne, this one runs entirely in
        your browser. Your files and text never leave your device.
      </p>
    </section>
  );
};
