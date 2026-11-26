import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { sanitizeWinAnsi, hasNonLatin } from '../shared/text';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 64;
const SIZE = 11;
const LINE_H = SIZE * 1.45;

const TxtToPdf = () => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('document');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, pages, replaced }

  const loadFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setText(await f.text());
    setFileName(f.name.replace(/\.[^.]+$/, '') || 'document');
    setResult(null);
    e.target.value = '';
  };

  const convert = async () => {
    if (!text.trim()) { setError('Enter some text first.'); return; }
    setBusy(true);
    setError('');
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const maxWidth = PAGE_W - MARGIN * 2;

      const paragraphs = String(text).replace(/\r\n?/g, '\n').split('\n');
      let page = pdf.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      const ensure = () => {
        if (y - LINE_H < MARGIN) {
          page = pdf.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - MARGIN;
        }
      };

      const wrap = (line) => {
        const clean = sanitizeWinAnsi(line).replace(/\t/g, '    ');
        if (!clean) return [''];
        const words = clean.split(' ');
        const out = [];
        let current = '';
        for (const word of words) {
          const next = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(next, SIZE) > maxWidth && current) {
            out.push(current);
            current = word;
          } else {
            current = next;
          }
        }
        if (current) out.push(current);
        return out.length ? out : [''];
      };

      for (const paragraph of paragraphs) {
        for (const line of wrap(paragraph)) {
          ensure();
          if (line) page.drawText(line, { x: MARGIN, y: y - SIZE, size: SIZE, font, color: rgb(0, 0, 0) });
          y -= LINE_H;
        }
      }

      pdf.setTitle(fileName || 'document');
      pdf.setProducer('3toOne');
      pdf.setCreator('3toOne');
      const outBytes = await pdf.save({ useObjectStreams: true });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        pages: pdf.getPageCount(),
        replaced: hasNonLatin(text)
      });
    } catch (err) {
      console.error(err);
      setError('Could not create a PDF from this text.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${fileName || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="TXT to PDF" description="Turn plain text into clean, selectable, paginated PDF pages.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Load a .txt file (optional)</label>
          <input className="tool-input" type="file" accept=".txt,text/plain" onChange={loadFile} />
          <label className="tool-label">Text</label>
          <textarea
            className="tool-textarea"
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); }}
            placeholder="Paste or type text here..."
            spellCheck={false}
          />
          <label className="tool-label">File name</label>
          <input
            className="tool-input"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value || 'document')}
            placeholder="document"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !text.trim()}>
            {busy ? 'Converting…' : 'Convert to PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>

        {result && (
          <p className="form-note">
            {result.pages} page{result.pages > 1 ? 's' : ''} created.
            {result.replaced && ' Characters outside the Latin alphabet were replaced with "?" because standard PDF fonts cannot encode them.'}
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

export default TxtToPdf;
