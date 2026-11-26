export const siteConfig = {
  name: '3toOne Social',
  tagline: 'Grow faster on Instagram and YouTube',
  // Production domain — set via VITE_SITE_URL. Canonicals and sitemaps are
  // only emitted when a URL is configured.
  url: import.meta.env.VITE_SITE_URL || '',
  mainUrl: import.meta.env.VITE_MAIN_SITE_URL || ''
};

export const SITE_URL = import.meta.env.VITE_SITE_URL || '';
export const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || '';
