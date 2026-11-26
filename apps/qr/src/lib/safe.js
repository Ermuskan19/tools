export const safeHref = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^(https?:|mailto:|tel:|upi:)/i.test(raw)) return raw;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(raw)) return `https://${raw}`;
  return '';
};
