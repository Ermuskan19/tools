import { Link } from 'react-router-dom';
import { Icons } from './Icons';
import { toolsData } from '../data/tools';

// Landing content rendered under every tool: how-it-works steps,
// FAQ (also emitted as JSON-LD by the prerender build), related tools
// and the privacy note. All copy comes from the registry — nothing hardcoded here.
export const ToolLanding = ({ tool }) => {
  if (!tool || !tool.steps?.length) return null;

  const related = toolsData
    .filter(t => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4);

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
              <Link key={t.slug} to={`/tools/${t.slug}`} className="related-chip">
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
