import { sanitizeWinAnsi, hasNonLatin } from './text';

/**
 * A deliberately small HTML → PDF renderer that runs entirely in the browser.
 * It keeps document structure (headings, paragraphs, lists, quotes, code,
 * rules, tables and data-URL images) while ignoring layout CSS, which browsers
 * cannot faithfully reproduce without a full rendering engine.
 */

export function htmlToBlocks(html, baseUrl) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  if (baseUrl) {
    const base = doc.createElement('base');
    base.href = baseUrl;
    doc.head.prepend(base);
  }
  const blocks = [];

  const pushText = (node, kind, extra = {}) => {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) blocks.push({ type: kind, text, ...extra });
  };

  const walk = (parent) => {
    for (const node of parent.children) {
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'template', 'svg', 'iframe'].includes(tag)) continue;
      const heading = tag.match(/^h([1-6])$/);
      if (heading) {
        pushText(node, 'heading', { level: Number(heading[1]) });
      } else if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article' || tag === 'header' || tag === 'footer' || tag === 'main' || tag === 'body') {
        if (node.children.length && !(node.textContent || '').trim()) {
          walk(node);
          continue;
        }
        const hasBlockChild = [...node.children].some((c) => /^(p|div|ul|ol|table|h[1-6]|blockquote|pre|section|article)$/i.test(c.tagName));
        if (hasBlockChild) {
          pushText(node, 'para');
          walk(node);
        } else {
          pushText(node, 'para');
        }
      } else if (tag === 'ul' || tag === 'ol') {
        let n = 1;
        for (const li of node.children) {
          if (li.tagName.toLowerCase() !== 'li') continue;
          pushText(li, 'item', { marker: tag === 'ul' ? '•' : `${n}.` });
          n += 1;
        }
      } else if (tag === 'blockquote') {
        pushText(node, 'quote');
      } else if (tag === 'pre') {
        const raw = (node.textContent || '').replace(/\s+$/, '');
        if (raw.trim()) blocks.push({ type: 'pre', text: raw });
      } else if (tag === 'hr') {
        blocks.push({ type: 'hr' });
      } else if (tag === 'table') {
        const rows = [...node.querySelectorAll('tr')].map((tr) =>
          [...tr.children].map((cell) => (cell.textContent || '').replace(/\s+/g, ' ').trim())
        );
        if (rows.length) blocks.push({ type: 'table', rows });
      } else if (tag === 'img') {
        blocks.push({ type: 'image', src: node.currentSrc || node.src || '', alt: node.alt || '' });
      } else if (tag === 'br') {
        blocks.push({ type: 'break' });
      } else {
        walk(node);
      }
    }
  };

  walk(doc.body);
  return blocks;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;

export async function htmlToPdfBytes(html, { title = 'Document', baseUrl } = {}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const blocks = htmlToBlocks(html, baseUrl);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const maxWidth = PAGE_W - MARGIN * 2;
  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };
  const ensure = (needed) => {
    if (y - needed < MARGIN) newPage();
  };

  const wrap = (text, f, size, width) => {
    const clean = sanitizeWinAnsi(text).replace(/\s+/g, ' ').trim();
    if (!clean) return [];
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

  const drawParagraph = (text, { size = 11, f = font, indent = 0, color = rgb(0, 0, 0), leading = 1.4, gapAfter = 7 } = {}) => {
    const lines = wrap(text, f, size, maxWidth - indent);
    for (const line of lines) {
      ensure(size * leading);
      page.drawText(line, { x: MARGIN + indent, y: y - size, size, font: f, color });
      y -= size * leading;
    }
    y -= gapAfter;
  };

  const headingSizes = { 1: 22, 2: 18, 3: 15, 4: 13, 5: 12, 6: 11 };

  for (const block of blocks) {
    if (block.type === 'heading') {
      y -= block.level <= 2 ? 6 : 3;
      drawParagraph(block.text, {
        size: headingSizes[block.level] || 11,
        f: bold,
        leading: 1.3,
        gapAfter: 9
      });
    } else if (block.type === 'para') {
      drawParagraph(block.text);
    } else if (block.type === 'item') {
      drawParagraph(`${block.marker} ${block.text}`, { indent: 16, gapAfter: 3 });
    } else if (block.type === 'quote') {
      drawParagraph(block.text, { f: italic, indent: 20, color: rgb(0.35, 0.35, 0.35), gapAfter: 9 });
    } else if (block.type === 'pre') {
      for (const rawLine of block.text.split('\n')) {
        const lines = wrap(rawLine || ' ', mono, 8.5, maxWidth) || [''];
        for (const line of lines) {
          ensure(13);
          page.drawText(line, { x: MARGIN, y: y - 9, size: 8.5, font: mono, color: rgb(0.12, 0.12, 0.12) });
          y -= 13;
        }
      }
      y -= 7;
    } else if (block.type === 'hr') {
      ensure(12);
      page.drawLine({
        start: { x: MARGIN, y: y - 4 },
        end: { x: PAGE_W - MARGIN, y: y - 4 },
        thickness: 0.75,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= 12;
    } else if (block.type === 'table') {
      const columns = Math.max(...block.rows.map((r) => r.length), 1);
      const widths = new Array(columns).fill(maxWidth / columns);
      block.rows.forEach((row, rowIndex) => {
        const cells = row.map((cell, i) => wrap(cell, rowIndex === 0 ? bold : font, 9, widths[i] - 8));
        const height = Math.max(...cells.map((c) => c.length), 1) * 12 + 6;
        ensure(height);
        cells.forEach((lines, i) => {
          const x = MARGIN + widths.slice(0, i).reduce((a, b) => a + b, 0);
          if (rowIndex === 0) {
            page.drawRectangle({ x, y: y - height, width: widths[i], height, color: rgb(0.95, 0.95, 0.97) });
          }
          page.drawRectangle({ x, y: y - height, width: widths[i], height, borderColor: rgb(0.82, 0.82, 0.85), borderWidth: 0.5 });
          lines.forEach((line, li) => {
            page.drawText(line, { x: x + 4, y: y - 12 - li * 12, size: 9, font: rowIndex === 0 ? bold : font });
          });
        });
        y -= height;
      });
      y -= 8;
    } else if (block.type === 'image') {
      try {
        if (!/^data:image\/(png|jpe?g);base64,/i.test(block.src)) continue;
        const bytes = Uint8Array.from(atob(block.src.split(',')[1]), (c) => c.charCodeAt(0));
        const img = /^data:image\/png/i.test(block.src) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const scale = Math.min(maxWidth / img.width, 340 / img.height, 1);
        const w = img.width * scale;
        const h = img.height * scale;
        ensure(h + 8);
        page.drawImage(img, { x: MARGIN, y: y - h, width: w, height: h });
        y -= h + 10;
      } catch {
        /* unsupported or corrupt image — skip rather than fail the document */
      }
    } else if (block.type === 'break') {
      y -= 8;
    }
  }

  if (hasNonLatin(blocks.map((b) => b.text || '').join(' '))) {
    doc.setSubject('Some characters outside the Latin alphabet were replaced with "?".');
  }
  doc.setTitle(sanitizeWinAnsi(title));
  doc.setProducer('3toOne');
  doc.setCreator('3toOne');
  return doc.save({ useObjectStreams: true });
}
