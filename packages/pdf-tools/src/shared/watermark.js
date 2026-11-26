import { sanitizeWinAnsi } from './text';

const ANCHORS = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'tile'];

/** Draw a text watermark on every selected page (rotation in degrees). */
export async function applyTextWatermark(doc, {
  text,
  size = 54,
  opacity = 0.28,
  angle = 40,
  color = [0.42, 0.28, 0.75],
  anchor = 'center',
  pages
}) {
  const { StandardFonts, rgb, degrees } = await import('pdf-lib');
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const clean = sanitizeWinAnsi(text).slice(0, 200) || 'WATERMARK';
  const targets = pages || doc.getPages();

  for (const page of targets) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(clean, size);
    const textHeight = font.heightAtSize(size);
    const paint = { size, font, color: rgb(...color), opacity, rotate: degrees(angle) };

    if (anchor === 'tile') {
      const stepX = Math.max(textWidth + 80, 180);
      const stepY = Math.max(textHeight + 130, 160);
      for (let y = -stepY; y < height + stepY; y += stepY) {
        for (let x = -stepX; x < width + stepX; x += stepX) {
          page.drawText(clean, { ...paint, x, y });
        }
      }
      continue;
    }

    const rad = (angle * Math.PI) / 180;
    let cx = width / 2;
    let cy = height / 2;
    if (anchor === 'top-left') { cx = width * 0.28; cy = height * 0.82; }
    if (anchor === 'top-right') { cx = width * 0.72; cy = height * 0.82; }
    if (anchor === 'bottom-left') { cx = width * 0.28; cy = height * 0.22; }
    if (anchor === 'bottom-right') { cx = width * 0.72; cy = height * 0.22; }

    page.drawText(clean, {
      ...paint,
      x: cx - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad),
      y: cy - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad)
    });
  }
}

/** Draw an uploaded PNG/JPG watermark on every selected page. */
export async function applyImageWatermark(doc, bytes, mime, {
  widthPct = 45,
  opacity = 0.25,
  angle = 0,
  anchor = 'center',
  pages
}) {
  const { degrees } = await import('pdf-lib');
  const image = /png$/i.test(mime) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  const targets = pages || doc.getPages();

  for (const page of targets) {
    const { width, height } = page.getSize();
    const w = (width * Math.min(100, Math.max(5, widthPct))) / 100;
    const h = (image.height / image.width) * w;
    const place = (cx, cy) =>
      page.drawImage(image, { x: cx - w / 2, y: cy - h / 2, width: w, height: h, opacity, rotate: degrees(angle) });

    if (anchor === 'tile') {
      const stepX = w * 0.75;
      const stepY = h * 0.9;
      for (let y = -stepY; y < height + stepY; y += stepY) {
        for (let x = -stepX; x < width + stepX; x += stepX) {
          page.drawImage(image, { x, y, width: w, height: h, opacity, rotate: degrees(angle) });
        }
      }
    } else if (anchor === 'top-left') place(width * 0.3, height * 0.8);
    else if (anchor === 'top-right') place(width * 0.7, height * 0.8);
    else if (anchor === 'bottom-left') place(width * 0.3, height * 0.2);
    else if (anchor === 'bottom-right') place(width * 0.7, height * 0.2);
    else place(width / 2, height / 2);
  }
}

export const WATERMARK_ANCHORS = ANCHORS;
