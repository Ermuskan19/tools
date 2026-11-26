// Registry for the 3toOne Dev category.
// Every entry here becomes a prerendered route and a card on the home page.
export const devTools = [
  {
    id: 1,
    slug: 'json-formatter',
    title: 'JSON Formatter and Validator',
    shortTitle: 'JSON Formatter',
    tagline: 'Format, check and repair JSON without leaving the page.',
    description:
      'Paste JSON and get it formatted, validated and ready to copy. If something is broken, you see the exact line and column — and can ask the formatter to fix it.',
    category: 'data',
    tags: ['Data', 'JSON'],
    icon: 'Braces',
    accent: 'lime',
    badge: 'NEW',
    keywords: ['json formatter', 'json validator', 'json beautifier', 'json minify', 'fix invalid json'],
    howTitle: 'Format JSON in 3 steps',
    steps: [
      { title: 'Paste or upload', text: 'Paste text, drop in a .json file, or load the sample.' },
      { title: 'See it checked', text: 'It formats and validates as you type. Errors show the line and column.' },
      { title: 'Copy or download', text: 'Copy the result, download it, or copy a link that carries the JSON in the URL.' }
    ],
    faqs: [
      {
        q: 'Is my JSON uploaded anywhere?',
        a: 'No. Formatting, validating and fixing all happen in your browser, so your data stays on your device.'
      },
      {
        q: 'Is the JSON Formatter free?',
        a: 'Yes. Format, minify, validate, sort keys and Fix it are all free, with no sign-up and no limit beyond a 1 MB file per paste.'
      },
      {
        q: 'How do I find the error in my JSON?',
        a: 'The error panel shows the line and column and rewrites the parser message in plain English. The bad line is highlighted in the input and shown with a caret under the exact column.'
      },
      {
        q: 'What does Fix it repair?',
        a: 'Trailing commas, single quotes, unquoted keys, // and /* */ comments, True/False/None, and missing closing brackets. It lists exactly what changed, then formats the repaired JSON.'
      },
      {
        q: 'What does Sort keys do?',
        a: 'It orders every object’s keys A to Z at every depth, which makes two JSON files easier to compare. Arrays keep their order.'
      },
      {
        q: 'Does it change my data?',
        a: 'No. Formatting only changes spacing. Sort keys changes the order of keys, never the values.'
      }
    ]
  },
  {
    id: 2,
    slug: 'base64',
    title: 'Base64 Encoder and Decoder',
    shortTitle: 'Base64',
    tagline: 'Turn text into Base64 and back, with UTF-8 handled properly.',
    description:
      'Encode text to Base64 or decode a Base64 string back to text. Emoji and non-English characters survive the round trip because the tool works in UTF-8.',
    category: 'encoding',
    tags: ['Encoding', 'Text'],
    icon: 'Code',
    accent: 'cyan',
    keywords: ['base64 encode', 'base64 decode', 'base64 converter', 'base64 to text'],
    howTitle: 'Encode and decode in 3 steps',
    steps: [
      { title: 'Pick a direction', text: 'Choose Encode or Decode, then paste your text or Base64 string.' },
      { title: 'Read the result', text: 'The output updates as you type, with an error if the Base64 is not valid.' },
      { title: 'Copy or swap', text: 'Copy the result, swap the two sides, or clear the box and start again.' }
    ],
    faqs: [
      {
        q: 'Is my text sent to a server?',
        a: 'No. Encoding and decoding run in your browser, so the text never leaves your device.'
      },
      {
        q: 'Does it handle emoji and other languages?',
        a: 'Yes. Text is converted to UTF-8 bytes before encoding, so emoji, Hindi, Chinese and other non-ASCII text survive the round trip.'
      },
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 is an encoding, not encryption. Anyone can decode it, so never use it to protect secrets.'
      },
      {
        q: 'Why does my decoded text look wrong?',
        a: 'Base64 is only bytes, not text. If the original was an image or a compressed file, decoding it as text will produce unreadable characters.'
      },
      {
        q: 'Should I use standard or URL-safe Base64?',
        a: 'Use standard Base64 for files and email-style data, and URL-safe Base64 (with - and _ instead of + and /) inside URLs and JWTs.'
      },
      {
        q: 'Is there a size limit?',
        a: 'No hard limit, but the page works best with text under about 1 MB. Very large inputs may slow the live update down.'
      }
    ]
  },
  {
    id: 3,
    slug: 'jwt-decoder',
    title: 'JWT Decoder',
    shortTitle: 'JWT Decoder',
    tagline: 'Read a token’s header, payload and expiry — decoded on your device.',
    description:
      'Paste a JSON Web Token to see its header and payload as readable JSON, when it expires, and what it claims. The signature is not verified.',
    category: 'security',
    tags: ['Security', 'Tokens'],
    icon: 'Key',
    accent: 'magenta',
    keywords: ['jwt decoder', 'decode jwt', 'jwt payload', 'jwt exp'],
    howTitle: 'Read a token in 3 steps',
    steps: [
      { title: 'Paste the token', text: 'Paste a JWT — the three-part string that starts with eyJ.' },
      { title: 'Read the claims', text: 'See the decoded header and payload, plus issued-at and expiry in plain language.' },
      { title: 'Copy the parts', text: 'Copy either part as JSON and check the warnings before trusting the token.' }
    ],
    faqs: [
      {
        q: 'Does decoding prove the token is valid?',
        a: 'No. Decoding only reads the contents. Anyone can write a token that decodes cleanly, so check the signature on your server before trusting it.'
      },
      {
        q: 'Is my token uploaded?',
        a: 'No. The token is decoded in your browser and never sent anywhere. Even so, avoid pasting production tokens into any website you do not control.'
      },
      {
        q: 'What do exp, iat and nbf mean?',
        a: 'exp is the expiry time, iat is when the token was issued, and nbf is the earliest time it may be used. All three are Unix timestamps in seconds.'
      },
      {
        q: 'Why is my token shown as expired?',
        a: 'The exp claim is in the past according to your device clock. Servers reject expired tokens, so the client should refresh or sign in again.'
      },
      {
        q: 'Why does a part fail to decode?',
        a: 'A JWT has three Base64url parts separated by dots, and the first two must be JSON objects. A copied fragment or a truncated token will fail.'
      },
      {
        q: 'Can I see the signature?',
        a: 'You can see that a signature part exists, but it cannot be read as JSON. Verifying it needs the signing key or public key, which stays on your server.'
      }
    ]
  },
  { id: 4, slug: 'json-viewer', title: 'JSON Viewer', shortTitle: 'JSON Viewer', tagline: 'Tree view and shareable link', description: 'View JSON as an interactive tree with expand/collapse and copy paths.', category: 'data', tags: ['Data', 'JSON'], icon: 'Braces', accent: 'lime', keywords: ['json viewer', 'json tree'], howTitle: 'Explore JSON in 3 steps', steps: [{ title: 'Paste JSON', text: 'Paste a document or load the sample into the input box.' }, { title: 'Open the tree', text: 'Expand objects and arrays to walk through the data.' }, { title: 'Copy what you need', text: 'Copy a value path or the selected node.' }], faqs: [{ q: 'Is my JSON uploaded?', a: 'No, everything runs in your browser.' }] },
  { id: 5, slug: 'json-to-csv', title: 'JSON to CSV', shortTitle: 'JSON to CSV', tagline: 'Convert JSON arrays to CSV', description: 'Convert an array of JSON objects into CSV with proper escaping.', category: 'data', tags: ['Data', 'JSON'], icon: 'Braces', accent: 'lime', keywords: ['json to csv'], howTitle: 'Convert JSON to CSV in 3 steps', steps: [{ title: 'Paste an array', text: 'Paste a JSON array of objects, one object per row.' }, { title: 'Convert', text: 'Nested values are stringified and quotes are escaped.' }, { title: 'Download the CSV', text: 'Copy the CSV text or download it as a file.' }], faqs: [{ q: 'Nested objects?', a: 'Nested values are stringified.' }] },
  { id: 6, slug: 'xml-formatter', title: 'XML Formatter', shortTitle: 'XML Formatter', tagline: 'Format and validate XML', description: 'Pretty-print and validate XML documents.', category: 'data', tags: ['Data', 'XML'], icon: 'Code', accent: 'cyan', keywords: ['xml formatter'], howTitle: 'Format XML in 3 steps', steps: [{ title: 'Paste XML', text: 'Paste a document into the input box.' }, { title: 'Format and check', text: 'Parser errors are shown instead of a result.' }, { title: 'Copy the output', text: 'Copy the pretty-printed XML.' }], faqs: [{ q: 'Validation?', a: 'Parser errors are shown.' }] },
  { id: 7, slug: 'csv-to-excel', title: 'CSV to Excel', shortTitle: 'CSV to Excel', tagline: 'Convert CSV to XLSX', description: 'Convert CSV content into an Excel XLSX file.', category: 'data', tags: ['Data'], icon: 'File', accent: 'cyan', keywords: ['csv to excel'], howTitle: 'Turn CSV into Excel in 3 steps', steps: [{ title: 'Paste CSV', text: 'Paste comma-separated rows into the input.' }, { title: 'Convert to XLSX', text: 'The rows are turned into an Excel sheet in your browser.' }, { title: 'Download the file', text: 'Save data.xlsx and open it in Excel or Sheets.' }], faqs: [{ q: 'Encoding?', a: 'UTF-8.' }] },
  { id: 8, slug: 'excel-to-csv', title: 'Excel to CSV', shortTitle: 'Excel to CSV', tagline: 'Extract CSV from XLSX', description: 'Read an Excel file and export as CSV.', category: 'data', tags: ['Data'], icon: 'File', accent: 'cyan', keywords: ['excel to csv'], howTitle: 'Extract CSV from Excel in 3 steps', steps: [{ title: 'Upload the workbook', text: 'Pick an .xlsx or .xls file from your device.' }, { title: 'Read the first sheet', text: 'The first sheet is converted to CSV.' }, { title: 'Download the CSV', text: 'Copy the text or save it as data.csv.' }], faqs: [{ q: 'Sheets?', a: 'First sheet used.' }] },
  { id: 9, slug: 'image-to-base64', title: 'Image to Base64', shortTitle: 'Image to Base64', tagline: 'Embed images as data URIs', description: 'Convert an image file to a Base64 data URI.', category: 'data', tags: ['Data', 'Image'], icon: 'Code', accent: 'lime', keywords: ['image to base64'], howTitle: 'Embed an image in 3 steps', steps: [{ title: 'Upload an image', text: 'Pick a PNG, JPG, GIF or WebP file.' }, { title: 'Get the data URI', text: 'The file is read as a Base64 data URI, with a preview.' }, { title: 'Copy the string', text: 'Paste it into CSS, HTML or JSON.' }], faqs: [{ q: 'Size limit?', a: 'Browser memory.' }] },
  { id: 10, slug: 'sql-formatter', title: 'SQL Formatter', shortTitle: 'SQL Formatter', tagline: 'Readable queries', description: 'Format SQL queries with keyword capitalization.', category: 'data', tags: ['Data', 'SQL'], icon: 'Code', accent: 'cyan', keywords: ['sql formatter'], howTitle: 'Format SQL in 3 steps', steps: [{ title: 'Paste a query', text: 'Paste any SELECT, INSERT, UPDATE or DELETE statement.' }, { title: 'Format', text: 'Keywords are capitalised and clauses move to their own lines.' }, { title: 'Copy the result', text: 'Copy the readable query back into your editor.' }], faqs: [{ q: 'Dialects?', a: 'Generic.' }] },
  { id: 11, slug: 'zip-compressor', title: 'ZIP Compressor', shortTitle: 'ZIP Compressor', tagline: 'Compress files in browser', description: 'Create a ZIP archive from selected files.', category: 'data', tags: ['Data', 'Files'], icon: 'File', accent: 'lime', keywords: ['zip compressor'], howTitle: 'Zip files in 3 steps', steps: [{ title: 'Select files', text: 'Pick one or more files from your device.' }, { title: 'Create the ZIP', text: 'Files are compressed in your browser with JSZip.' }, { title: 'Download the archive', text: 'Save archive.zip and share it.' }], faqs: [{ q: 'Client-side?', a: 'Yes.' }] },
  { id: 12, slug: 'file-converter', title: 'File Converter', shortTitle: 'File Converter', tagline: 'One hub linking every converter', description: 'Hub linking all converters.', category: 'data', tags: ['Data'], icon: 'File', accent: 'lime', keywords: ['file converter'], howTitle: 'Convert a file in 3 steps', steps: [{ title: 'Pick a converter', text: 'Choose the conversion you need from the list.' }, { title: 'Add your file', text: 'Each converter accepts the file types it supports.' }, { title: 'Download the result', text: 'Converted files are saved straight to your device.' }], faqs: [{ q: 'Free?', a: 'Yes.' }] },
  { id: 13, slug: 'html-minifier', title: 'HTML Minifier', shortTitle: 'HTML Minifier', tagline: 'See size savings before and after', description: 'Minify HTML by removing comments and whitespace.', category: 'code', tags: ['Code'], icon: 'Code', accent: 'cyan', keywords: ['html minifier'], howTitle: 'Minify HTML in 3 steps', steps: [{ title: 'Paste HTML', text: 'Paste the markup you want to shrink.' }, { title: 'Minify', text: 'Comments and repeated whitespace are removed.' }, { title: 'Copy the output', text: 'Copy the minified HTML into your project.' }], faqs: [{ q: 'Safe?', a: 'Removes comments.' }] },
  { id: 14, slug: 'css-minifier', title: 'CSS Minifier', shortTitle: 'CSS Minifier', tagline: 'See size savings before and after', description: 'Minify CSS.', category: 'code', tags: ['Code'], icon: 'Code', accent: 'cyan', keywords: ['css minifier'], howTitle: 'Minify CSS in 3 steps', steps: [{ title: 'Paste CSS', text: 'Paste a stylesheet or a single rule.' }, { title: 'Minify', text: 'Comments and spacing are stripped.' }, { title: 'Copy the output', text: 'Copy the minified CSS.' }], faqs: [{ q: 'Safe?', a: 'Removes comments.' }] },
  { id: 15, slug: 'js-minifier', title: 'JS Minifier', shortTitle: 'JS Minifier', tagline: 'See size savings before and after', description: 'Minify JavaScript.', category: 'code', tags: ['Code'], icon: 'Code', accent: 'cyan', keywords: ['js minifier'], howTitle: 'Minify JavaScript in 3 steps', steps: [{ title: 'Paste JavaScript', text: 'Paste the script you want to shrink.' }, { title: 'Minify', text: 'Comments and repeated whitespace are removed.' }, { title: 'Copy the output', text: 'Copy the minified script.' }], faqs: [{ q: 'Safe?', a: 'Removes comments.' }] },
  { id: 16, slug: 'url-encoder-decoder', title: 'URL Encoder and Decoder', shortTitle: 'URL Encoder/Decoder', tagline: 'Query string helper', description: 'Encode or decode URL components.', category: 'code', tags: ['Code'], icon: 'Link', accent: 'magenta', keywords: ['url encoder'], howTitle: 'Encode or decode a URL in 3 steps', steps: [{ title: 'Paste text or a URL', text: 'Add the value you want to convert.' }, { title: 'Encode or decode', text: 'Pick a direction; invalid escapes show an error.' }, { title: 'Copy the result', text: 'Copy the encoded or decoded value.' }], faqs: [{ q: 'UTF-8?', a: 'Yes.' }] },
  { id: 17, slug: 'markdown-to-html', title: 'Markdown to HTML', shortTitle: 'Markdown to HTML', tagline: 'Live preview', description: 'Convert Markdown to HTML.', category: 'code', tags: ['Code'], icon: 'Code', accent: 'cyan', keywords: ['markdown to html'], howTitle: 'Convert Markdown in 3 steps', steps: [{ title: 'Paste Markdown', text: 'Headings, bold, italics, code and links are supported.' }, { title: 'Convert', text: 'The Markdown is turned into HTML in your browser.' }, { title: 'Copy the HTML', text: 'Paste the markup into your page or CMS.' }], faqs: [{ q: 'GFM?', a: 'Basic.' }] },
  { id: 18, slug: 'color-gradient-css', title: 'Color and Gradient CSS', shortTitle: 'Color and Gradient CSS', tagline: 'Copy-ready CSS', description: 'Generate CSS gradients.', category: 'code', tags: ['Code'], icon: 'Bolt', accent: 'magenta', keywords: ['css gradient'], howTitle: 'Build a gradient in 3 steps', steps: [{ title: 'Pick two colours', text: 'Choose the start and end colours.' }, { title: 'Set the angle', text: 'Change the angle to turn the gradient.' }, { title: 'Copy the CSS', text: 'Paste the gradient rule into your stylesheet.' }], faqs: [{ q: 'Angles?', a: 'Yes.' }] },
  { id: 19, slug: 'regex-tester', title: 'Regex Tester', shortTitle: 'Regex Tester', tagline: 'Explains every match', description: 'Test regular expressions against text.', category: 'code', tags: ['Code'], icon: 'Code', accent: 'cyan', keywords: ['regex tester'], howTitle: 'Test a regex in 3 steps', steps: [{ title: 'Enter a pattern', text: 'Type the expression and any flags such as g or i.' }, { title: 'Add test text', text: 'Matches are highlighted as you type.' }, { title: 'Read the matches', text: 'See every match and the total count.' }], faqs: [{ q: 'Flags?', a: 'g i m etc.' }] },
  { id: 20, slug: 'uuid-generator', title: 'UUID Generator', shortTitle: 'UUID Generator', tagline: 'Generate in bulk', description: 'Generate UUID v4 values.', category: 'code', tags: ['Code'], icon: 'Key', accent: 'magenta', keywords: ['uuid generator'], howTitle: 'Generate UUIDs in 3 steps', steps: [{ title: 'Choose a count', text: 'Pick how many UUIDs you need, up to 100.' }, { title: 'Generate', text: 'Values are created with crypto.randomUUID().' }, { title: 'Copy the list', text: 'Copy all the UUIDs as one list.' }], faqs: [{ q: 'Version?', a: 'v4.' }] },
  { id: 21, slug: 'meta-tag-generator', title: 'Meta Tag Generator', shortTitle: 'Meta Tag Generator', tagline: 'Live previews', description: 'Generate meta and OG tags.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['meta tag generator'], howTitle: 'Write meta tags in 3 steps', steps: [{ title: 'Fill the fields', text: 'Add a title, description, URL and image.' }, { title: 'Watch the tags', text: 'Title, description, Open Graph and Twitter tags update live.' }, { title: 'Copy the tags', text: 'Paste them into your page head.' }], faqs: [{ q: 'Twitter?', a: 'Included.' }] },
  { id: 22, slug: 'schema-markup-generator', title: 'Schema Markup Generator', shortTitle: 'Schema Markup Generator', tagline: 'FAQ, product and local business', description: 'Generate JSON-LD schema.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['schema markup'], howTitle: 'Build schema markup in 3 steps', steps: [{ title: 'Fill the fields', text: 'Add the site name, description and URL.' }, { title: 'Get the JSON-LD', text: 'A WebSite schema is generated as you type.' }, { title: 'Copy the script tag', text: 'Paste the JSON-LD into your page.' }], faqs: [{ q: 'Types?', a: 'WebSite.' }] },
  { id: 23, slug: 'open-graph-checker', title: 'Open Graph Checker', shortTitle: 'Open Graph Checker', tagline: 'Debug social previews', description: 'Parse OG and Twitter tags from HTML.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['og checker'], howTitle: 'Check a social preview in 3 steps', steps: [{ title: 'Paste HTML', text: 'Paste the page source that contains your meta tags.' }, { title: 'Read the tags', text: 'Open Graph and Twitter tags are listed with their values.' }, { title: 'Fix the gaps', text: 'Add any missing tags to your page head.' }], faqs: [{ q: 'Missing?', a: 'Highlighted.' }] },
  { id: 24, slug: 'keyword-density-checker', title: 'Keyword Density Checker', shortTitle: 'Keyword Density Checker', tagline: 'Compare against competitors', description: 'Count word frequency and density.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['keyword density'], howTitle: 'Check keyword density in 3 steps', steps: [{ title: 'Paste your text', text: 'Add the page copy you want to analyse.' }, { title: 'Read the table', text: 'The top 30 words are ranked by count and percentage.' }, { title: 'Adjust the copy', text: 'Rewrite repeating words to balance density.' }], faqs: [{ q: 'Stop words?', a: 'No filtering.' }] },
  { id: 25, slug: 'sitemap-generator', title: 'Sitemap Generator', shortTitle: 'Sitemap Generator', tagline: 'Platform presets', description: 'Generate sitemap XML.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['sitemap generator'], howTitle: 'Build a sitemap in 3 steps', steps: [{ title: 'Set the base URL', text: 'Enter the site the URLs belong to.' }, { title: 'List the paths', text: 'Add one path per line.' }, { title: 'Download the XML', text: 'Save sitemap.xml and submit it to search engines.' }], faqs: [{ q: 'Format?', a: 'sitemaps.org.' }] },
  { id: 26, slug: 'robots-txt-generator', title: 'Robots.txt Generator', shortTitle: 'Robots.txt Generator', tagline: 'Platform presets', description: 'Generate robots.txt.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['robots txt'], howTitle: 'Write robots.txt in 3 steps', steps: [{ title: 'Fill the rules', text: 'Set the Allow, Disallow and sitemap values.' }, { title: 'Check the output', text: 'The file updates as you type.' }, { title: 'Copy the file', text: 'Save it as robots.txt in your site root.' }], faqs: [{ q: 'Sitemap?', a: 'Optional.' }] },
  { id: 27, slug: 'website-speed-checker', title: 'Website Speed Checker', shortTitle: 'Website Speed Checker', tagline: 'Score plus fix list', description: 'Check site reachability timing.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['speed checker'], howTitle: 'Check page speed in 3 steps', steps: [{ title: 'Enter a URL', text: 'Add the page you want to measure.' }, { title: 'Run the check', text: 'The page is requested and timed from your browser.' }, { title: 'Read the timing', text: 'Cross-origin limits can make the number approximate.' }], faqs: [{ q: 'CORS?', a: 'Approximate.' }] },
  { id: 28, slug: 'broken-link-checker', title: 'Broken Link Checker', shortTitle: 'Broken Link Checker', tagline: 'Report export', description: 'Check links in pasted content.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['broken link'], howTitle: 'Find broken links in 3 steps', steps: [{ title: 'Paste HTML or URLs', text: 'Add markup or a plain list of links.' }, { title: 'Run the check', text: 'Every URL found is requested once.' }, { title: 'Review the report', text: 'See which links are reachable and which fail.' }], faqs: [{ q: 'CORS?', a: 'Approximate.' }] },
  { id: 29, slug: 'domain-authority-checker', title: 'Domain Authority Checker', shortTitle: 'Domain Authority Checker', tagline: 'Needs third-party data', description: 'DNS lookup for a domain.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['domain authority'], howTitle: 'Look up a domain in 3 steps', steps: [{ title: 'Enter a domain', text: 'Type the domain without a path.' }, { title: 'Run the lookup', text: 'DNS records are fetched for the domain.' }, { title: 'Read the result', text: 'Inspect the returned DNS data.' }], faqs: [{ q: 'DA score?', a: 'Use DNS info.' }] },
  { id: 30, slug: 'ssl-checker', title: 'SSL Checker', shortTitle: 'SSL Checker', tagline: 'Expiry alerts in Pro', description: 'Check HTTPS reachability.', category: 'seo', tags: ['SEO'], icon: 'Shield', accent: 'lime', keywords: ['ssl checker'], howTitle: 'Check HTTPS in 3 steps', steps: [{ title: 'Enter a domain', text: 'Type the host you want to test.' }, { title: 'Run the check', text: 'The HTTPS endpoint is requested from your browser.' }, { title: 'Read the result', text: 'Detailed certificate data needs a server-side check.' }], faqs: [{ q: 'Cert details?', a: 'Server-side needed.' }] },
  { id: 31, slug: 'whois-lookup', title: 'WHOIS Lookup', shortTitle: 'WHOIS Lookup', tagline: 'Domain details', description: 'RDAP/WHOIS lookup.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['whois'], howTitle: 'Look up a domain in 3 steps', steps: [{ title: 'Enter a domain', text: 'Type the domain you want to look up.' }, { title: 'Run the lookup', text: 'Registration data is fetched over RDAP.' }, { title: 'Read the record', text: 'Inspect registrar, status and dates.' }], faqs: [{ q: 'Data?', a: 'RDAP.' }] },
  { id: 32, slug: 'redirect-checker', title: 'Redirect Checker', shortTitle: 'Redirect Checker', tagline: 'See the full redirect chain', description: 'Check redirect behavior.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['redirect checker'], howTitle: 'Trace redirects in 3 steps', steps: [{ title: 'Enter a URL', text: 'Add the link you want to follow.' }, { title: 'Run the check', text: 'The request follows redirects to the final URL.' }, { title: 'Read the chain', text: 'Cross-origin limits may hide the final destination.' }], faqs: [{ q: 'Chain?', a: 'Best-effort.' }] },
  { id: 33, slug: 'seo-audit-report', title: 'SEO Audit Report', shortTitle: 'SEO Audit Report', tagline: 'White-label PDF for clients', description: 'Basic SEO audit of pasted HTML.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['seo audit'], howTitle: 'Audit a page in 3 steps', steps: [{ title: 'Paste HTML', text: 'Add the page source you want to audit.' }, { title: 'Read the checks', text: 'Title, description, H1, image alt text and links are checked.' }, { title: 'Fix what fails', text: 'Update the page and run the audit again.' }], faqs: [{ q: 'White-label?', a: 'Pro.' }] },
  { id: 34, slug: 'favicon-generator', title: 'Favicon Generator', shortTitle: 'Favicon Generator', tagline: 'All sizes in one zip', description: 'Generate favicon sizes from an image.', category: 'seo', tags: ['SEO'], icon: 'Bolt', accent: 'lime', keywords: ['favicon generator'], howTitle: 'Make favicons in 3 steps', steps: [{ title: 'Upload an image', text: 'Pick a square PNG or JPG to use as the icon.' }, { title: 'Choose sizes', text: 'Download any size from 16×16 to 512×512.' }, { title: 'Add to your site', text: 'Upload the files and link them in your page head.' }], faqs: [{ q: 'Formats?', a: 'PNG.' }] }
];

export const devToolsBySlug = Object.fromEntries(devTools.map((t) => [t.slug, t]));

export const DEV_SITE = {
  name: '3toOne Dev',
  tagline: 'Developer tools that run entirely in your browser',
  description:
    'Free developer tools that run in your browser: JSON formatter and validator, Base64 encoder and decoder, and a JWT decoder. No sign-up, nothing uploaded.'
};

// Sections shown on the home page.
export const devCategories = [
  { id: 'data', label: 'Data and files' },
  { id: 'encoding', label: 'Encoding' },
  { id: 'security', label: 'Security' }
];
