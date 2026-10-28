import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import { StaticRouter } from 'react-router';
import App from './App';
import { toolsData, toolsBySlug, SITE } from './data/tools';

export { SITE };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Every route that gets prerendered to static HTML at build time.
export const routes = () => ['/', ...toolsData.map((t) => `/tools/${t.slug}`)];

// Head data per route: unique title/description/canonical + JSON-LD.
export function headFor(path) {
  if (path === '/') {
    return {
      title: `${SITE.name} — ${SITE.tagline}`,
      description:
        'Free online developer tools that run entirely in your browser: PDF utilities, image compressors and converters, calculators, counters, generators, and more. No uploads, no sign-up.',
      canonical: `${SITE.url}/`,
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: `${SITE.url}/`,
        description: SITE.tagline
      }
    };
  }

  const slug = path.split('/')[2];
  const tool = toolsBySlug[slug];
  if (!tool) return null;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.title,
      description: tool.description,
      applicationCategory: 'UtilitiesApplication',
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
    title: `${tool.title} — Free Online Tool | ${SITE.name}`,
    description: tool.description,
    canonical: `${SITE.url}/tools/${tool.slug}`,
    jsonld
  };
}

// Render the app to an HTML string for a given route path.
export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}

// Inject head data + rendered markup into the built HTML template.
export function applyTemplate(template, path, markup, head) {
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(head.title)}</title>`);
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${esc(head.description)}$2`
  );
  const extraHead =
    `\n<link rel="canonical" href="${head.canonical}" />` +
    (head.jsonld
      ? `\n<script type="application/ld+json">${JSON.stringify(head.jsonld)}</script>`
      : '');
  html = html.replace('</head>', `${extraHead}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  return html;
}
