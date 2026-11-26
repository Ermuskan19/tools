import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { calcToolsBySlug } from '../data/calcTools';
import { EmiCalculator } from '../tools/EmiCalculator';
import { SipCalculator } from '../tools/SipCalculator';
import { FdCalculator } from '../tools/FdCalculator';
import { IncomeTaxCalculator } from '../tools/IncomeTaxCalculator';
import { SalaryCalculator } from '../tools/SalaryCalculator';
import { GenericCalc } from '../tools/GenericCalc';

const NEW_SLUGS = [
  'loan-calculator','rent-vs-buy-calculator','hra-exemption-calculator','gratuity-calculator','pf-calculator','gst-calculator',
  'step-up-sip-calculator','lumpsum-calculator','rd-calculator','compound-interest-calculator','simple-interest-calculator',
  'age-calculator','cgpa-to-percentage-calculator','percentage-calculator','bmi-calculator','time-calculator',
  'date-difference-calculator','working-days-calculator','unit-converter','currency-converter','number-to-words',
  'electricity-bill-calculator','discount-calculator','trip-fuel-cost-calculator','gst-invoice-generator','quotation-receipt-maker'
];
const TOOL_COMPONENTS = {
  'emi-calculator': EmiCalculator,
  'sip-calculator': SipCalculator,
  'fd-calculator': FdCalculator,
  'income-tax-calculator': IncomeTaxCalculator,
  'inhand-salary-calculator': SalaryCalculator,
  ...Object.fromEntries(NEW_SLUGS.map((s) => [s, GenericCalc]))
};

const NotFound = () => (
  <div className="shell section">
    <Link to="/" className="back-link"><Icons.ArrowLeft /> All calculators</Link>
    <h1 className="notfound-title">Calculator not found</h1>
    <p className="muted">The calculator you are looking for does not exist.</p>
  </div>
);

export const CalcToolPage = () => {
  const { slug } = useParams();
  const tool = calcToolsBySlug[slug];
  const Component = TOOL_COMPONENTS[slug];

  if (!tool || !Component) return <NotFound />;

  return (
    <>
      <header className="tool-hero">
        <div className="shell">
          <Link to="/" className="back-link"><Icons.ArrowLeft /> All calculators</Link>
          <h1>{tool.title}</h1>
          <p className="tool-sub">{tool.description}</p>
          <div className="hero-chips center">
            <span className="chip">Free, no sign-up</span>
            <span className="chip">Live results</span>
            <span className="chip">Nothing leaves your browser</span>
          </div>
        </div>
      </header>

      <div className="shell">
        <Component title={tool.title} description={tool.description} slug={slug} />

        {tool.highlights && (
          <section className="why-section">
            <div className="why-head">
              <span className="eyebrow">{tool.highlights.eyebrow}</span>
              <h2>{tool.highlights.title}</h2>
              <p>{tool.highlights.lead}</p>
            </div>
            <div className="why-grid">
              {tool.highlights.cards.map((card) => {
                const Icon = Icons[card.icon] || Icons.Check;
                return (
                  <div className="why-card" key={card.title}>
                    <span className={`why-icon ${card.tone}`}><Icon /></span>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="landing-section">
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

          <p className="privacy-note">
            <Icons.Check /> 100% private — this calculator runs entirely in your
            browser. Your numbers never leave your device.
          </p>
        </section>
      </div>
    </>
  );
};

export default CalcToolPage;
