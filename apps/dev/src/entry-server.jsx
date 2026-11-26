import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import { StaticRouter } from 'react-router';
import App from './App';
import { DEV_SITE, devTools, devToolsBySlug } from './data/devTools';

export { DEV_SITE as SITE };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Every route that gets prerendered to static HTML at build time.
export const routes = () => ['/', ...devTools.map((t) => `/${t.slug}`)];

export function headFor(path) {
  if (path === '/') {
    return {
      title: `${DEV_SITE.name} — ${DEV_SITE.tagline}`,
      description: DEV_SITE.description,
      canonical: DEV_SITE.url ? `${DEV_SITE.url}/` : null,
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: DEV_SITE.name,
        url: DEV_SITE.url ? `${DEV_SITE.url}/` : undefined,
        description: DEV_SITE.description
      }
    };
  }

  const slug = path.split('/')[1];
  const tool = devToolsBySlug[slug];
  if (!tool) return null;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.title,
      description: tool.description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    },
    ...(tool.faqs?.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tool.faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          }
        ]
      : [])
  ];

  return {
    title: `${tool.title} — Free Online Tool | ${DEV_SITE.name}`,
    description: tool.description,
    canonical: DEV_SITE.url ? `${DEV_SITE.url}/${tool.slug}` : null,
    jsonld
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
    (head.jsonld
      ? `\n<script type="application/ld+json">${JSON.stringify(head.jsonld)}</script>`
      : '');
  html = html.replace('</head>', `${extraHead}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  return html;
}
