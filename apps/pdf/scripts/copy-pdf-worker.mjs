// pdf.js needs its worker as a static file. Vite cannot resolve an asset URL
// from inside a workspace package, so keep an exact copy in public/ and refresh
// it whenever the app starts or builds.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../public/pdf.worker.mjs');

const candidates = [
  'pdfjs-dist/build/pdf.worker.mjs',
  'pdfjs-dist/build/pdf.worker.min.mjs'
];

let source = null;
for (const candidate of candidates) {
  try {
    source = require.resolve(candidate);
    break;
  } catch { /* try the next name */ }
}

if (!source) {
  console.warn('[pdf-worker] pdfjs-dist worker not found — skipping copy');
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`[pdf-worker] copied ${source} to public/pdf.worker.mjs`);
