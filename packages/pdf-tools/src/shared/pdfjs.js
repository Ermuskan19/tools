// Single place that loads pdf.js and points it at the worker shipped in the
// app's public/ folder (apps/pdf/scripts/copy-pdf-worker.mjs keeps it in sync).
const WORKER_URL = '/pdf.worker.mjs';

let loader = null;

export function loadPdfjs() {
  if (!loader) {
    loader = import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
      return pdfjs;
    });
  }
  return loader;
}

/** Render every page of a PDF to a PNG data URL plus display-space metrics. */
export async function renderPdfPages(file, { scale = 1.6, maxPages = 60 } = {}) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data: data.slice() });
  const pdf = await task.promise;
  const pages = [];
  const count = Math.min(pdf.numPages, maxPages);
  try {
    for (let i = 1; i <= count; i++) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport, background: '#ffffff' }).promise;
      pages.push({
        index: i,
        url: canvas.toDataURL('image/png'),
        width: base.width,
        height: base.height,
        rotation: ((page.rotate || 0) % 360 + 360) % 360
      });
      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await task.destroy();
  }
  return pages;
}

/** Extract the text of each page as a plain string (page order kept). */
export async function extractPageTexts(file) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data: data.slice() });
  const pdf = await task.promise;
  const texts = [];
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lines = [];
      let line = [];
      let lastY = null;
      for (const item of content.items) {
        if (!item.str && item.str !== '') continue;
        const y = item.transform ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
          lines.push(line.join(''));
          line = [];
        }
        if (item.str) line.push(item.str);
        if (item.hasEOL) line.push('\n');
        if (y !== null) lastY = y;
      }
      if (line.length) lines.push(line.join(''));
      texts.push(lines.join('\n').replace(/[ \t]+\n/g, '\n').trim());
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
  return texts;
}

export async function getPageSize(file) {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), {
    ignoreEncryption: true
  });
  return {
    pageCount: doc.getPageCount(),
    sizes: doc.getPages().map((p) => p.getSize())
  };
}

/** Load a PDF through pdf.js and hand back the document plus page count. */
export async function openPdf(file) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data: data.slice() }).promise;
}
