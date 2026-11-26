import { sanitizeWinAnsi } from './text';

/**
 * Minimal .pptx reader: unzips the deck, follows the presentation relationship
 * order and pulls the text of each slide's paragraphs. Runs fully client-side.
 */
export async function readPptx(file) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const textOf = (xml, tag) => {
    const out = [];
    const re = new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`, 'g');
    for (const m of xml.match(re) || []) out.push(m);
    return out;
  };

  // Presentation order: /ppt/presentation.xml sldIdLst → rels → slide targets.
  let slidePaths = [];
  try {
    const pres = await zip.file('ppt/presentation.xml')?.async('string');
    const rels = await zip.file('ppt/_rels/presentation.xml.rels')?.async('string');
    if (pres && rels) {
      const relMap = {};
      for (const rel of textOf(rels, 'Relationship')) {
        const id = rel.match(/Id="([^"]+)"/)?.[1];
        const target = rel.match(/Target="([^"]+)"/)?.[1];
        if (id && target) relMap[id] = target.replace(/^\.?\//, '').replace(/^ppt\//, '');
      }
      const ids = (pres.match(/<p:sldId [^>]*r:id="([^"]+)"/g) || []).map(
        (m) => m.match(/r:id="([^"]+)"/)[1]
      );
      slidePaths = ids.map((id) => relMap[id]).filter(Boolean).map((p) => (p.startsWith('ppt/') ? p : `ppt/${p}`));
    }
  } catch {
    /* fall back to numeric order below */
  }

  if (!slidePaths.length) {
    slidePaths = Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
  }

  const slides = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const xml = await zip.file(slidePaths[i])?.async('string');
    if (!xml) continue;
    const paragraphs = [];
    for (const p of textOf(xml, 'a:p')) {
      const text = textOf(p, 'a:t')
        .map((t) => t.replace(/<[^>]+>/g, ''))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) paragraphs.push(text);
    }
    slides.push({ index: i + 1, paragraphs });
  }
  return slides;
}

/** Build a landscape hand-out PDF (one page per slide) from parsed slides. */
export async function slidesToPdfBytes(slides, { title = 'Presentation', sourceName = '' } = {}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 960;
  const H = 540;
  const M = 64;
  const maxW = W - M * 2;

  const wrap = (text, f, size, width) => {
    const clean = sanitizeWinAnsi(text).replace(/\s+/g, ' ').trim();
    const lines = [];
    let line = '';
    for (const word of clean.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(next, size) > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  for (const slide of slides) {
    const page = doc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: rgb(0.62, 0.36, 0.9) });

    const [headline, ...body] = slide.paragraphs;
    let y = H - M;
    if (headline) {
      const lines = wrap(headline, bold, 30, maxW).slice(0, 3);
      for (const line of lines) {
        page.drawText(line, { x: M, y: y - 30, size: 30, font: bold, color: rgb(0.1, 0.1, 0.15) });
        y -= 40;
      }
      y -= 10;
      page.drawLine({
        start: { x: M, y: y + 6 },
        end: { x: M + 90, y: y + 6 },
        thickness: 3,
        color: rgb(0.62, 0.36, 0.9)
      });
      y -= 26;
    }

    for (const para of body) {
      const lines = wrap(para, font, 16, maxW).slice(0, 9);
      for (const line of lines) {
        if (y - 24 < M) break;
        page.drawText(line, { x: M + 4, y: y - 16, size: 16, font, color: rgb(0.22, 0.22, 0.28) });
        y -= 24;
      }
      y -= 10;
      if (y - 24 < M) break;
    }

    if (!slide.paragraphs.length) {
      page.drawText('(no text on this slide)', { x: M, y: H / 2, size: 16, font, color: rgb(0.5, 0.5, 0.5) });
    }
    page.drawText(`${slide.index} / ${slides.length}`, {
      x: W - M - 40,
      y: 28,
      size: 10,
      font,
      color: rgb(0.55, 0.55, 0.6)
    });
    if (sourceName) {
      page.drawText(sanitizeWinAnsi(sourceName).slice(0, 60), { x: M, y: 28, size: 9, font, color: rgb(0.6, 0.6, 0.65) });
    }
  }

  if (!doc.getPageCount()) doc.addPage([W, H]);
  doc.setTitle(sanitizeWinAnsi(title));
  doc.setProducer('3toOne');
  doc.setCreator('3toOne');
  return doc.save({ useObjectStreams: true });
}

/** PDF page text → .pptx slides using pptxgenjs. */
export async function textPagesToPptx(pageTexts, { title = 'Presentation' } = {}) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = title;

  pageTexts.forEach((lines, pageIndex) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };
    const [headline, ...body] = lines.filter(Boolean);
    if (headline) {
      slide.addText(headline, {
        x: 0.6, y: 0.45, w: 8.8, h: 0.9,
        fontSize: 28, bold: true, color: '1A1A2E', valign: 'middle'
      });
      slide.addShape(pptx.ShapeType.rect, { x: 0.62, y: 1.36, w: 1.1, h: 0.05, fill: { color: '9E5CE6' } });
    }
    if (body.length) {
      slide.addText(
        body.slice(0, 12).map((line) => ({ text: line, options: { bullet: true, breakLine: true } })),
        { x: 0.65, y: 1.6, w: 8.7, h: 3.6, fontSize: 15, color: '333344', valign: 'top' }
      );
    }
    slide.addText(`${pageIndex + 1} / ${pageTexts.length}`, {
      x: 8.4, y: 5.1, w: 1, h: 0.3, fontSize: 10, color: '999999', align: 'right'
    });
  });

  if (!pageTexts.length) pptx.addSlide().addText('Empty document', { x: 1, y: 2.2, w: 8, h: 1, fontSize: 24 });
  return pptx.write({ outputType: 'blob' });
}
