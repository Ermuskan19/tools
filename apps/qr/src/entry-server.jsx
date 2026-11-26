import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import { StaticRouter } from 'react-router';
import App from './App';
import { qrTools, qrToolsBySlug, QR_SITE } from './data/qrTools';

export { QR_SITE as SITE };

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const routes = () => ['/', ...qrTools.map((t) => `/${t.slug}`)];

export function headFor(path) {
  if (path === '/') {
    return {
      title: `${QR_SITE.name} — ${QR_SITE.tagline}`,
      description:
        'QR codes made for Indian shops: UPI payments, menus, Google reviews and WhatsApp chats. Create in seconds, print-ready, free to start.',
      canonical: QR_SITE.url ? `${QR_SITE.url}/` : null,
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: QR_SITE.name,
        url: QR_SITE.url ? `${QR_SITE.url}/` : undefined,
        description: QR_SITE.tagline
      }
    };
  }

  const slug = path.split('/')[1];
  const tool = qrToolsBySlug[slug];
  if (!tool) return null;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.title,
      description: tool.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }
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
    title: `${tool.title} — Free QR Tool | ${QR_SITE.name}`,
    description: tool.tagline,
    canonical: QR_SITE.url ? `${QR_SITE.url}/${tool.slug}` : null,
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
  html = html.replace('<div id="root"></div>', `<div id="root" data-prerender-path="${esc(path)}">${markup}</div>`);
  return html;
}
