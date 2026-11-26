import { Link } from 'react-router-dom';
import { ToolLayout } from '@zegnite/shared-ui';

const POINTS = [
  {
    title: 'Everything runs in your browser',
    body: 'No uploads, no servers. Every PDF job happens entirely on your device — your files never leave your computer.'
  },
  {
    title: 'Built for India',
    body: 'Exam-ready and KYC-ready tools made for Indian forms: marksheet bundles, bank statements, Aadhaar masking and more.'
  },
  {
    title: 'No sign-up for basic tools',
    body: 'Start using compress, merge, convert and more instantly — no account, no email, no credit card required.'
  },
  {
    title: 'Exact-size compression',
    body: 'Pick 100 KB, 200 KB, 500 KB or 1 MB and the compressor tunes quality to fit your upload limit.'
  },
  {
    title: 'Hindi and Indic OCR',
    body: 'Turn scanned pages in Hindi and other Indian languages into searchable, copyable text.'
  },
  {
    title: 'Every PDF tool in one place',
    body: 'Convert, organize, optimize, edit, sign and secure PDFs — all free, all private, all in your browser.'
  }
];

export const Why3toOne = () => (
  <ToolLayout
    title="Why 3toOne PDF"
    description="Why choose 3toOne PDF for all your PDF needs."
    backLabel="Back to home"
  >
    <div className="tool-pane-single">
      <div className="why-choose">
        <h2 className="section-title">Here’s what makes 3toOne PDF different</h2>
        <div className="why-grid">
          {POINTS.map((p, i) => (
            <div key={i} className="why-item">
              <div className="why-num">{i + 1}</div>
              <div>
                <strong>{p.title}</strong>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="page-cta">
        <p>See it for yourself — every tool is free.</p>
        <Link to="/" className="tool-btn tool-btn-primary">Browse all PDF tools</Link>
      </div>
    </div>
  </ToolLayout>
);

export default Why3toOne;
