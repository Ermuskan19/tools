import QRCode from 'qrcode';

export const qrDataUrl = (text, { size = 512, margin = 2, dark = '#0F766E', light = '#ffffff' } = {}) =>
  QRCode.toDataURL(text || ' ', {
    width: size,
    margin,
    errorCorrectionLevel: 'M',
    color: { dark, light }
  });

export const qrSvg = (text, { margin = 2, dark = '#0F766E', light = '#ffffff' } = {}) =>
  QRCode.toString(text || ' ', {
    type: 'svg',
    margin,
    errorCorrectionLevel: 'M',
    color: { dark, light }
  });

export const downloadUrl = (href, filename) => {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const downloadSvg = (markup, filename) => {
  const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const encodeShare = (value) => {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeShare = (value) => {
  if (!value) return null;
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

export const shareUrl = (kind, data) => {
  const encoded = encodeShare(data);
  const fallback = 'https://3toone.in/qr';
  const base = typeof window !== 'undefined' ? window.location.origin : fallback;
  return `${base}/${kind}#data=${encoded}`;
};
