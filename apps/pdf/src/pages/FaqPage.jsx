import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';

const FAQS = [
  { q: 'Is 3toOne PDF free to use?', a: 'Yes. Most tools are free and need no sign-up.' },
  { q: 'Are my files safe?', a: 'Processing happens in your browser; nothing is uploaded to a server.' },
  { q: 'What is the maximum file size?', a: 'Depends on your device memory; typical documents of tens of MB work fine.' },
  { q: 'Can it read Hindi and other Indian languages?', a: 'Yes — Hindi and Indic OCR is supported.' },
  { q: 'Can I compress a PDF to an exact size?', a: 'Yes — pick a target KB and the compressor tunes quality to fit.' },
  { q: 'Which file formats are supported?', a: 'Every tool works with PDFs; the converters also accept Word (.docx), Excel (.xlsx), PowerPoint (.pptx), JPG and TXT.' },
  { q: 'Can I use 3toOne PDF on my phone?', a: 'Yes — all the tools work in mobile browsers, no app needed.' },
  { q: 'Do I need an account?', a: 'No.' },
  { q: 'What is 3toOne?', a: 'A browser-based collection of free utilities. Everything runs on your device.' }
];

export const FaqPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <ToolLayout
      title="Frequently Asked Questions"
      description="Common questions about 3toOne PDF."
      backLabel="Back to home"
    >
      <div className="tool-pane-single">
        <div className="faq">
          <dl className="landing-faq">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <dt>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true"></span>
                  </button>
                </dt>
                <dd className="faq-answer">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </ToolLayout>
  );
};

export default FaqPage;
