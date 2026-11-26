export const siteConfig = {
  name: '3toOne PDF',
  tagline: 'Free online PDF tools that run entirely in your browser',
  // Production domain — set via VITE_SITE_URL. Left empty until you purchase a domain;
  // canonicals/sitemaps are emitted only when a URL is configured.
  url: import.meta.env.VITE_SITE_URL || '',
  mainUrl: import.meta.env.VITE_MAIN_SITE_URL || ''
};

export const SITE_URL = import.meta.env.VITE_SITE_URL || '';
export const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || '';
