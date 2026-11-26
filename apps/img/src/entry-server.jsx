import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import { StaticRouter } from 'react-router';
import App from './App';
import { imgTools, IMG_SITE } from './data/imgTools';

export { IMG_SITE as SITE };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const routes = () => ['/', ...imgTools.map((t) => `/${t.slug}`)];

export function headFor(path) {
  if (path === '/') {
    return {
      title: `${IMG_SITE.name} — ${IMG_SITE.tagline}`,
      description:
        '28 image tools built for India: resize, compress and clean images for exams, IDs and online stores. Exact sizes, exact KB, zero guesswork.',
      canonical: IMG_SITE.url ? `${IMG_SITE.url}/` : null,
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: IMG_SITE.name,
        url: IMG_SITE.url ? `${IMG_SITE.url}/` : undefined,
        description: IMG_SITE.tagline,
      },
    };
  }
  const slug = path.split('/')[1];
  const tool = imgTools.find((t) => t.slug === slug);
  if (!tool) return null;
  return {
    title: `${tool.title} — Free Online Image Tool | ${IMG_SITE.name}`,
    description: tool.tagline,
    canonical: IMG_SITE.url ? `${IMG_SITE.url}/${tool.slug}` : null,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.title,
      description: tool.description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
  };
}

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}

export function applyTemplate(template, path, markup, head) {
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(head.title)}</title>`);
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${esc(head.description)}$2`
  );
  const extraHead =
    (head.canonical ? `\n<link rel="canonical" href="${head.canonical}" />` : '') +
    (head.jsonld ? `\n<script type="application/ld+json">${JSON.stringify(head.jsonld)}</script>` : '');
  html = html.replace('</head>', `${extraHead}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  return html;
}
