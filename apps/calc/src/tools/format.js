export const inr = (x) =>
  Number.isFinite(x) ? `₹${Math.round(x).toLocaleString('en-IN')}` : '—';

export const compact = (x) => {
  if (!Number.isFinite(x)) return '—';
  if (x >= 1e7) return `₹${+(x / 1e7).toFixed(2)} Cr`;
  if (x >= 1e5) return `₹${+(x / 1e5).toFixed(2)} L`;
  if (x >= 1e3) return `₹${+(x / 1e3).toFixed(1)}K`;
  return `₹${Math.round(x)}`;
};

export const pct = (x, places = 2) =>
  Number.isFinite(x) ? `${+x.toFixed(places)}%` : '—';
