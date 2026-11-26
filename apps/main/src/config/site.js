export const siteConfig = {
  name: '3toOne',
  tagline: 'Free online tools that run entirely in your browser',
  // Production domain — set via VITE_SITE_URL. Left empty until you purchase a domain;
  // canonicals/sitemaps are emitted only when a URL is configured.
  url: import.meta.env.VITE_SITE_URL || '',
  pdfUrl: import.meta.env.VITE_PDF_SITE_URL || '',
  calcUrl: import.meta.env.VITE_CALC_SITE_URL || '',
  devUrl: import.meta.env.VITE_DEV_SITE_URL || '',
  imgUrl: import.meta.env.VITE_IMG_SITE_URL || '',
  qrUrl: import.meta.env.VITE_QR_SITE_URL || '',
  socialUrl: import.meta.env.VITE_SOCIAL_SITE_URL || ''
};

export const SITE_URL = import.meta.env.VITE_SITE_URL || '';
export const PDF_SITE_URL = import.meta.env.VITE_PDF_SITE_URL || '';
export const CALC_SITE_URL = import.meta.env.VITE_CALC_SITE_URL || '';
export const DEV_SITE_URL = import.meta.env.VITE_DEV_SITE_URL || '';
export const IMG_SITE_URL = import.meta.env.VITE_IMG_SITE_URL || '';
export const QR_SITE_URL = import.meta.env.VITE_QR_SITE_URL || '';
export const SOCIAL_SITE_URL = import.meta.env.VITE_SOCIAL_SITE_URL || '';
