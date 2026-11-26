import { renderPdfPages } from './pdfjs';

/**
 * True redaction helper.
 *
 * Painted rectangles on top of a PDF page do NOT remove the text underneath —
 * it stays extractable. For pages that carry boxes we therefore rasterize the
 * page, burn the boxes into the pixels and rebuild the page from that image.
 * Pages without boxes are copied untouched so the rest keeps its text layer.
 */
export async function buildRedactedPdf(file, boxes, { scale = 2, color = '#000000' } = {}) {
  if (!boxes.length) throw new Error('Add at least one box to redact.');
  const pages = await renderPdfPages(file, { scale });
  const pageNumbers = [...new Set(boxes.map((b) => b.page))];

  const flat = new Map();
  for (const page of pages) {
    if (!pageNumbers.includes(page.index)) continue;
    const img = await loadImage(page.url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const kx = canvas.width / page.width;
    const ky = canvas.height / page.height;
    ctx.fillStyle = color;
    for (const box of boxes.filter((b) => b.page === page.index)) {
      ctx.fillRect(box.x * kx, box.y * ky, box.w * kx, box.h * ky);
    }
    flat.set(page.index, {
      jpeg: canvas.toDataURL('image/jpeg', 0.92).split(',')[1],
      width: page.width,
      height: page.height
    });
    canvas.width = 0;
    canvas.height = 0;
  }

  const { PDFDocument } = await import('pdf-lib');
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const srcPages = src.getPages();

  for (let i = 0; i < srcPages.length; i++) {
    const pageIndex = i + 1;
    const burned = flat.get(pageIndex);
    if (burned) {
      const image = await out.embedJpg(burned.jpeg);
      const page = out.addPage([burned.width, burned.height]);
      page.drawImage(image, { x: 0, y: 0, width: burned.width, height: burned.height });
    } else {
      const [copied] = await out.copyPages(src, [i]);
      out.addPage(copied);
    }
  }

  out.setProducer('3toOne');
  out.setCreator('3toOne');
  return out.save({ useObjectStreams: true });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not rasterize the page.'));
    img.src = src;
  });
}
