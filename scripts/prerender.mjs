// Post-build prerender step: renders every registry route to static HTML
// inside dist/, then writes sitemap.xml and robots.txt.
//
// Run via: npm run build   (vite build → SSR bundle → node scripts/prerender.mjs)
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const ssrEntry = join(process.cwd(), 'dist-ssr', 'entry-server.js');

const { routes, headFor, render, applyTemplate, SITE } = await import(
  new URL(`file://${ssrEntry.replace(/\\/g, '/')}`)
);

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const allRoutes = routes();
let written = 0;

for (const route of allRoutes) {
  const head = headFor(route);
  if (!head) continue;
  const markup = render(route);
  const html = applyTemplate(template, route, markup, head);

  if (route === '/') {
    writeFileSync(join(distDir, 'index.html'), html);
  } else {
    const dir = join(distDir, ...route.split('/').filter(Boolean));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
  written++;
}

// 404 fallback that some static hosts serve for unknown paths.
cpSync(join(distDir, 'index.html'), join(distDir, '404.html'));

const urls = allRoutes
  .map((r) => `  <url><loc>${SITE.url}${r === '/' ? '/' : r}</loc></url>`)
  .join('\n');
writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
writeFileSync(
  join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`
);

console.log(`Prerendered ${written} routes (${allRoutes.length} requested) + sitemap.xml + robots.txt`);
