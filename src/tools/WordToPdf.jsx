import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160,
  0x2039, 0x152, 0x17d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x17e, 0x178
]);

const sanitize = (s) =>
  [...s]
    .map((ch) => {
      const c = ch.codePointAt(0);
      return c <= 0xff || WINANSI_EXTRA.has(c) ? ch : '?';
    })
    .join('');

const runsFrom = (el) => {
  const runs = [];
  const walk = (node, bold, italic) => {
    if (node.nodeType === 3) {
      if (node.textContent) runs.push({ text: node.textContent, bold, italic });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    const b = bold || tag === 'strong' || tag === 'b';
    const i = italic || tag === 'em' || tag === 'i';
    if (tag === 'br') {
      runs.push({ text: ' ', bold: b, italic: i });
      return;
    }
    for (const child of node.childNodes) walk(child, b, i);
  };
  for (const child of el.childNodes) walk(child, false, false);
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && last.bold === r.bold && last.italic === r.italic) last.text += r.text;
    else merged.push({ ...r });
  }
  return merged;
};

const blocksFromHtml = (html) => {
  const root = new DOMParser().parseFromString(html, 'text/html');
  const blocks = [];
  for (const node of root.body.children) {
    const tag = node.tagName.toLowerCase();
    const m = tag.match(/^h([1-6])$/);
    if (m) {
      blocks.push({ kind: 'heading', level: Number(m[1]), runs: runsFrom(node) });
    } else if (tag === 'p') {
      blocks.push({ kind: 'para', runs: runsFrom(node) });
    } else if (tag === 'ul' || tag === 'ol') {
      let n = 1;
      for (const li of node.children) {
        blocks.push({
          kind: 'para',
          bullet: tag === 'ul' ? '•' : `${n}.`,
          runs: runsFrom(li)
        });
        n += 1;
      }
    } else if (tag === 'blockquote') {
      blocks.push({ kind: 'quote', runs: runsFrom(node) });
    } else if (tag === 'pre') {
      blocks.push({ kind: 'pre', runs: runsFrom(node) });
    } else {
      blocks.push({ kind: 'para', runs: runsFrom(node) });
    }
  }
  return blocks.filter((b) => b.runs.some((r) => r.text.trim()));
};

const HEADING_SIZES = { 1: 20, 2: 16, 3: 14, 4: 12.5, 5: 11.5, 6: 11 };

const WordToPdf = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, size, pages, blocks }

  const handleFile = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    setResult(null);
    setError('');
    e.target.value = '';
    if (f && !/\.docx$/i.test(f.name)) {
      setError('Only .docx files are supported. If you have an old .doc file, open it in Word and save as .docx first.');
      setFile(null);
    }
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const mammoth = (await import('mammoth')).default;
      const { value: html } = await mammoth.convertToHtml({
        arrayBuffer: await file.arrayBuffer()
      });
      const blocks = blocksFromHtml(html);
      if (!blocks.length) {
        setError('No readable text found in this document.');
        return;
      }

      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      const fonts = {
        normal: await doc.embedFont(StandardFonts.Helvetica),
        bold: await doc.embedFont(StandardFonts.HelveticaBold),
        italic: await doc.embedFont(StandardFonts.HelveticaOblique),
        boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
        mono: await doc.embedFont(StandardFonts.Courier),
        monoBold: await doc.embedFont(StandardFonts.CourierBold)
      };

      const PAGE = [595.28, 841.89];
      const MARGIN = 64;
      const maxWidth = PAGE[0] - MARGIN * 2;
      let page = doc.addPage(PAGE);
      let y = PAGE[1] - MARGIN;

      const ensureSpace = (needed) => {
        if (y - needed < MARGIN) {
          page = doc.addPage(PAGE);
          y = PAGE[1] - MARGIN;
        }
      };

      const fontFor = (r, mono) => {
        if (mono) return r.bold ? fonts.monoBold : fonts.mono;
        if (r.bold && r.italic) return fonts.boldItalic;
        if (r.bold) return fonts.bold;
        if (r.italic) return fonts.italic;
        return fonts.normal;
      };

      const wrapRuns = (runs, size, maxW, mono) => {
        const spaceW = fonts.normal.widthOfTextAtSize(' ', size);
        const lines = [];
        let line = [];
        let lineW = 0;
        for (const r of runs) {
          const f = fontFor(r, mono);
          const words = sanitize(r.text).split(/\s+/).filter(Boolean);
          for (const word of words) {
            const ww = f.widthOfTextAtSize(word, size);
            const add = (line.length ? spaceW : 0) + ww;
            if (lineW + add > maxW && line.length) {
              lines.push(line);
              line = [{ text: word, f }];
              lineW = ww;
            } else {
              line.push({ text: word, f });
              lineW += add;
            }
          }
        }
        if (line.length) lines.push(line);
        return lines.length ? lines : [[]];
      };

      const drawLines = (lines, size, leftIndent, color) => {
        const lineHeight = size * 1.35;
        for (const line of lines) {
          ensureSpace(lineHeight);
          let x = MARGIN + leftIndent;
          for (const w of line) {
            if (!w.f) continue;
            page.drawText(w.text, {
              x,
              y: y - size,
              size,
              font: w.f,
              color: color || rgb(0, 0, 0)
            });
            x += w.f.widthOfTextAtSize(w.text, size) + fonts.normal.widthOfTextAtSize(' ', size);
          }
          y -= lineHeight;
        }
      };

      for (const block of blocks) {
        if (block.kind === 'heading') {
          const size = HEADING_SIZES[block.level] || 11;
          y -= 6;
          ensureSpace(size * 1.5);
          drawLines(wrapRuns(block.runs, size, maxWidth, false), size, 0, rgb(0, 0, 0));
          y -= 4;
        } else if (block.kind === 'quote') {
          y -= 4;
          drawLines(wrapRuns(block.runs, 11, maxWidth - 24, false), 11, 24, rgb(0.35, 0.35, 0.35));
          y -= 4;
        } else if (block.kind === 'pre') {
          y -= 4;
          drawLines(wrapRuns(block.runs, 9, maxWidth, true), 9, 0, rgb(0.15, 0.15, 0.15));
          y -= 4;
        } else {
          let runs = block.runs;
          let indent = 0;
          if (block.bullet) {
            const bullet = { text: `${block.bullet} `, bold: false, italic: false };
            runs = [bullet, ...runs];
            indent = 12;
          }
          drawLines(wrapRuns(runs, 11, maxWidth - indent, false), 11, indent, rgb(0, 0, 0));
          y -= 7;
        }
      }

      doc.setTitle(file.name.replace(/\.docx$/i, ''));
      doc.setProducer('3toOne');
      doc.setCreator('3toOne');
      const outBytes = await doc.save({ useObjectStreams: true });

      if (result) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        size: outBytes.length,
        pages: doc.getPageCount(),
        blocks: blocks.length
      });
    } catch (err) {
      console.error(err);
      setError('Could not convert this document — it may be corrupted or password-protected.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.docx$/i, '')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Word to PDF" description="Turn Word documents into clean, shareable PDFs without uploading a single file.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Word document (.docx)</label>
          <input className="tool-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} />
        </div>

        {file && !result && (
          <p className="form-note">Original size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Converting…' : 'Convert to PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>

        {result && (
          <div className="control-row stats-row">
            <div className="stat-card"><div className="stat-value">{result.pages}</div><div className="stat-label">Pages</div></div>
            <div className="stat-card"><div className="stat-value">{result.blocks.toLocaleString()}</div><div className="stat-label">Paragraphs</div></div>
            <div className="stat-card"><div className="stat-value">{(result.size / 1024).toFixed(0)} KB</div><div className="stat-label">PDF size</div></div>
          </div>
        )}

        {result && (
          <object data={result.url} type="application/pdf" className="pdf-preview" aria-label="PDF preview" />
        )}

        <p className="form-note">
          Text, headings, bold/italic, and lists are preserved. Images and complex table layouts are simplified in this version — the PDF is generated as clean, selectable text.
        </p>
      </div>
    </ToolLayout>
  );
};

export default WordToPdf;
