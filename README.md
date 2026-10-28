# 3toOne

A browser-based collection of 30 free utilities — PDF merge/split/compress, PDF↔Word conversion, image compress/resize/convert, background removal, calculators, counters, generators, formatters, and more. Everything runs locally in the browser; no backend, no uploads, no accounts.

## Stack

- [React 19](https://react.dev) + [Vite 8](https://vite.dev)
- [React Router 7](https://reactrouter.com) for `/` and `/tools/:slug` routes
- Tailwind CSS 4 (via `@tailwindcss/vite`) plus hand-written CSS in `src/index.css` and `src/tools.css`
- [`qrcode`](https://www.npmjs.com/package/qrcode) for QR generation; Web Crypto and `<canvas>` for hashing and image work

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # client build + SSR bundle + prerender all routes into dist/
npm run preview  # serve the production build
npm run lint     # eslint
```

## Project structure

```
src/
├── App.jsx              # routes, navbar, hero, category tabs, tool grid
├── main.jsx             # entry point (BrowserRouter, hydrates prerendered HTML)
├── entry-server.jsx     # SSR entry: route list, per-route SEO head, render()
├── index.css            # theme variables and global styles
├── tools.css            # layout and component styles for tool pages
├── components/
│   ├── ToolLayout.jsx   # shared page shell for every tool (syncs document title)
│   ├── ToolLanding.jsx  # registry-driven how-it-works, FAQ, related tools
│   ├── CopyButton.jsx   # clipboard button
│   └── Icons.jsx        # inline SVG icon set
├── data/
│   └── tools.js         # tool registry: slug, SEO keywords, steps, FAQs, category
└── tools/               # one component per tool
scripts/
└── prerender.mjs        # post-build: static HTML per route + sitemap/robots
```

## Adding a tool

1. Create `src/tools/MyTool.jsx` exporting a component that wraps its UI in `ToolLayout`.
2. Register it in `src/data/tools.js` with a unique `slug`, `title`, `description`, `icon`, `tags`, `category`, plus SEO fields: `keywords`, `steps` (3 how-it-works steps), and `faqs` (3 Q/A pairs). This copy powers the landing page, meta tags, and FAQ JSON-LD — keep it unique per tool.
3. Import it in `src/App.jsx` and add it to the `ToolComponents` map keyed by the same slug.

The next `npm run build` prerenders the new `/tools/<slug>` page and adds it to the sitemap automatically.

Icons referenced by a tool must exist in `src/components/Icons.jsx`.

## Included tools

**Documents:** PDF Merger, PDF Splitter, PDF Compressor, PDF to Word, Word to PDF

**Images:** Image Optimizer (compress), Image Resizer, Image Converter, JPG to PNG, PNG to JPG, Background Remover

**Text & social:** Word & Character Counter, Case Converter, Keyword Density Checker, Hashtag Generator, YouTube Title Generator, Bio Generator

**Calculators:** GST Calculator, EMI Calculator

**Dev:** JSON Formatter, Regex Tester, Base64 Encode/Decode, URL Encode/Decode, Meta Tag Generator, UUID Generator, Hash Generator

**Design & utility:** CSS Gradient Maker, Lorem Ipsum Generator, Password Generator, QR Code Generator
