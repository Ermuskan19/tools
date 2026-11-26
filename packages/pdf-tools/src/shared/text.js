const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160,
  0x2039, 0x152, 0x17d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x17e, 0x178
]);

/**
 * pdf-lib's standard fonts only encode WinAnsi (Latin-1 + a few symbols).
 * Replace anything else so document generation never throws mid-conversion.
 */
export const sanitizeWinAnsi = (s) =>
  [...String(s ?? '')]
    .map((ch) => {
      const c = ch.codePointAt(0);
      if (c === 0x09 || c === 0x0a) return ' ';
      return c <= 0xff || WINANSI_EXTRA.has(c) ? ch : '?';
    })
    .join('');

export const hasNonLatin = (s) => sanitizeWinAnsi(s) !== String(s ?? '');

export const formatBytes = (n) => {
  if (!Number.isFinite(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};
