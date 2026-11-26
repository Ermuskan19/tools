// JSON helpers for the 3toOne Dev JSON Formatter.
// Everything here runs in the browser; nothing is uploaded.

export const unitFor = (mode) => (mode === 'tab' ? '\t' : mode === 4 ? '    ' : '  ');

export const byteSize = (text) => {
  if (!text) return 0;
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
};

export const formatBytes = (n) => {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 100) return `${kb.toFixed(1)} KB`;
  return `${Math.round(kb)} KB`;
};

export const sortKeysDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort((a, b) => a.localeCompare(b))) {
      out[key] = sortKeysDeep(value[key]);
    }
    return out;
  }
  return value;
};

export const countKeys = (value) => {
  let count = 0;
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) {
        count += 1;
        walk(v[k]);
      }
    }
  };
  walk(value);
  return count;
};

export const depthOf = (value) => {
  const walk = (v) => {
    if (Array.isArray(v)) return 1 + Math.max(0, ...v.map(walk));
    if (v && typeof v === 'object') {
      const keys = Object.keys(v);
      if (!keys.length) return 1;
      return 1 + Math.max(...keys.map((k) => walk(v[k])));
    }
    return 0;
  };
  if (Array.isArray(value)) return walk(value);
  if (value && typeof value === 'object') return walk(value);
  return 0;
};

const cleanMessage = (message = '') =>
  message
    .replace(/\s*in JSON at position \d+.*$/i, '')
    .replace(/\s*at position \d+ \(line \d+ column \d+\)$/i, '')
    .replace(/\s*at line \d+ column \d+.*$/i, '')
    .trim();

const locate = (text, message) => {
  const lineCol = message.match(/line (\d+) column (\d+)/i);
  if (lineCol) {
    return { line: Number(lineCol[1]), column: Number(lineCol[2]) };
  }
  const pos = message.match(/position (\d+)/i);
  if (pos) {
    const index = Math.min(Number(pos[1]), text.length);
    const before = text.slice(0, index);
    const line = before.split('\n').length;
    return { line, column: index - before.lastIndexOf('\n') };
  }
  return null;
};

const hintFor = (raw, lineText, prevLine = '') => {
  const m = raw.toLowerCase();
  const trimmed = (lineText || '').trim();
  const joined = `${prevLine || ''}\n${lineText || ''}`;

  // Trailing commas are the most common cause, and the parser wording for them
  // is misleading ("expected double-quoted property name"), so check them first.
  if (
    /,\s*[}\]]/.test(joined) ||
    (/,\s*$/.test(prevLine || '') && /^[}\]]/.test(trimmed))
  ) {
    return 'There is a trailing comma before a closing brace or bracket. JSON does not allow a comma after the last item.';
  }
  if (/unexpected end of json/.test(m) || /end of data|unexpected end/.test(m)) {
    return 'The JSON ends too early. A { or [ is never closed — add the missing bracket at the end.';
  }
  if (/double-quoted property name|property name/.test(m)) {
    return 'Object keys must be wrapped in double quotes: "name": value — not name: value and not \'name\': value.';
  }
  if (/'/.test(trimmed)) {
    return 'JSON only allows double quotes. This line seems to use single quotes — swap them for ".';
  }
  if (/\/\//.test(trimmed) || /\/\*/.test(trimmed)) {
    return 'JSON does not allow comments. Remove the // or /* */ text.';
  }
  if (/bad control character/.test(m)) {
    return 'There is a raw line break or tab inside a string. Use \\n or \\t instead.';
  }
  if (/bad escaped character/.test(m)) {
    return 'A backslash is followed by a character JSON cannot escape. Valid escapes are \\" \\\\ \\/ \\b \\f \\n \\r \\t \\uXXXX.';
  }
  if (/unterminated string/.test(m)) {
    return 'A string is missing its closing double quote.';
  }
  if (/expected ':'/.test(m)) {
    return 'A key is missing its colon. It should look like "key": value.';
  }
  if (/after json|non-whitespace/.test(m)) {
    return 'There is extra text after the JSON value. Only one top-level value is allowed.';
  }
  if (/unexpected token/.test(m)) {
    return 'The parser expected a value here. Check for a missing comma, a stray character, or a key without quotes.';
  }
  return 'Check the highlighted line for a missing comma, a missing quote, or a bracket that does not match.';
};

export const describeError = (text, message) => {
  const where = locate(text, message);
  const lines = text.split('\n');
  const line = where ? Math.min(where.line, lines.length) || 1 : 1;
  const column = where ? Math.max(where.column, 1) : 1;
  const lineText = lines[line - 1] ?? '';

  // Keep very long lines readable around the error column.
  const maxLen = 160;
  let snippet = lineText;
  let caretAt = column - 1;
  if (lineText.length > maxLen) {
    const start = Math.max(0, Math.min(caretAt - 60, lineText.length - maxLen));
    snippet = (start > 0 ? '…' : '') + lineText.slice(start, start + maxLen) + (start + maxLen < lineText.length ? '…' : '');
    caretAt = caretAt - start + (start > 0 ? 1 : 0);
  }
  caretAt = Math.max(0, Math.min(caretAt, snippet.length));

  return {
    raw: cleanMessage(message) || 'Invalid JSON',
    line,
    column,
    lineText,
    hint: hintFor(message, lineText, lines[line - 2] || ''),
    caret: `${' '.repeat(caretAt)}^`,
    snippet
  };
};

export const parseJson = (text) => {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (e) {
    return { ok: false, value: null, error: describeError(text, e.message) };
  }
};

// Walk the source outside of string literals, applying fn to plain code chunks.
const mapOutsideStrings = (src, fn) => {
  let out = '';
  let i = 0;
  let chunk = '';
  let inString = false;
  let escape = false;

  const flush = () => {
    if (chunk) {
      out += fn(chunk);
      chunk = '';
    }
  };

  while (i < src.length) {
    const c = src[i];
    if (inString) {
      out += c;
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') inString = false;
      i += 1;
      continue;
    }
    if (c === '"') {
      flush();
      inString = true;
      out += c;
      i += 1;
      continue;
    }
    chunk += c;
    i += 1;
  }
  flush();
  return out;
};

export const repairJson = (source) => {
  const changes = [];
  let text = source;
  let changed = false;

  // 1. Strip comments and normalise single-quoted strings.
  {
    let out = '';
    let i = 0;
    let inString = false;
    let quote = null;
    let sawComment = false;
    let sawSingle = false;

    while (i < text.length) {
      const c = text[i];
      if (inString) {
        if (c === '\\') {
          const next = text[i + 1] ?? '';
          if (quote === "'" && next === "'") out += "'";
          else out += c + next;
          i += 2;
          continue;
        }
        if (c === quote) {
          out += '"';
          inString = false;
          quote = null;
          i += 1;
          continue;
        }
        if (c === '"' && quote === "'") out += '\\"';
        else if (c === '\n') out += '\\n';
        else out += c;
        i += 1;
        continue;
      }
      if (c === '"' || c === "'") {
        inString = true;
        quote = c;
        out += '"';
        if (c === "'") sawSingle = true;
        i += 1;
        continue;
      }
      if (c === '/' && text[i + 1] === '/') {
        while (i < text.length && text[i] !== '\n') i += 1;
        sawComment = true;
        continue;
      }
      if (c === '/' && text[i + 1] === '*') {
        i += 2;
        while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1;
        i += 2;
        sawComment = true;
        continue;
      }
      out += c;
      i += 1;
    }
    text = out;
    if (sawComment) changes.push('comments removed');
    if (sawSingle) changes.push('single quotes changed to double quotes');
    changed = changed || sawComment || sawSingle;
  }

  // 2. Quote bare keys.
  const beforeKeys = text;
  text = mapOutsideStrings(text, (chunk) =>
    chunk.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
  );
  if (text !== beforeKeys) {
    changes.push('unquoted keys quoted');
    changed = true;
  }

  // 3. Python-style literals.
  const beforeLiterals = text;
  text = mapOutsideStrings(text, (chunk) =>
    chunk
      .replace(/\b(True|TRUE)\b/g, 'true')
      .replace(/\b(False|FALSE)\b/g, 'false')
      .replace(/\b(None|NULL|undefined)\b/g, 'null')
  );
  if (text !== beforeLiterals) {
    changes.push('True/False/None replaced with JSON values');
    changed = true;
  }

  // 4. Trailing commas.
  const beforeCommas = text;
  text = mapOutsideStrings(text, (chunk) => chunk.replace(/,(\s*[}\]])/g, '$1'));
  if (text !== beforeCommas) {
    changes.push('trailing commas removed');
    changed = true;
  }

  // 5. Missing closing brackets.
  {
    let stack = [];
    let inString = false;
    let escape = false;
    for (const c of text) {
      if (inString) {
        if (escape) escape = false;
        else if (c === '\\') escape = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') inString = true;
      else if (c === '{' || c === '[') stack.push(c);
      else if (c === '}' || c === ']') stack.pop();
    }
    if (stack.length) {
      const missing = stack.length;
      text = text.replace(/[\s,]*$/, '');
      while (stack.length) {
        const open = stack.pop();
        text += open === '{' ? '}' : ']';
      }
      changes.push(`${missing} missing closing bracket${missing === 1 ? '' : 's'} added`);
      changed = true;
    }
  }

  const parsed = parseJson(text);
  if (!parsed.ok) return { ok: false, changes: [], text: source };
  return { ok: true, changes: changed ? changes : [], text };
};

export const highlightTokens = (line) => {
  const tokens = [];
  let i = 0;
  let buf = '';
  const push = (type, value) => {
    if (value) tokens.push({ type, value });
  };
  const flush = () => {
    push('tp', buf);
    buf = '';
  };

  while (i < line.length) {
    const c = line[i];
    if (c === '"') {
      flush();
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') j += 2;
        else if (line[j] === '"') {
          j += 1;
          break;
        } else j += 1;
      }
      const raw = line.slice(i, j);
      let k = j;
      while (k < line.length && /\s/.test(line[k])) k += 1;
      push(line[k] === ':' ? 'tk' : 'ts', raw);
      i = j;
      continue;
    }
    if ('{}[],:'.includes(c)) {
      flush();
      push('tp', c);
      i += 1;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(line[i + 1] || ''))) {
      flush();
      let j = i;
      if (line[j] === '-') j += 1;
      while (j < line.length && /[0-9]/.test(line[j])) j += 1;
      if (line[j] === '.') {
        j += 1;
        while (j < line.length && /[0-9]/.test(line[j])) j += 1;
      }
      if (line[j] === 'e' || line[j] === 'E') {
        j += 1;
        if (line[j] === '+' || line[j] === '-') j += 1;
        while (j < line.length && /[0-9]/.test(line[j])) j += 1;
      }
      push('tn', line.slice(i, j));
      i = j;
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      flush();
      let j = i;
      while (j < line.length && /[A-Za-z]/.test(line[j])) j += 1;
      const word = line.slice(i, j);
      push(word === 'true' || word === 'false' ? 'tb' : word === 'null' ? 'tl' : 'tp', word);
      i = j;
      continue;
    }
    buf += c;
    i += 1;
  }
  flush();
  return tokens;
};

export const buildOutput = (value, { indent = 2, sort = false, minify = false } = {}) => {
  const data = sort ? sortKeysDeep(value) : value;
  if (minify) return JSON.stringify(data);
  return JSON.stringify(data, null, unitFor(indent));
};

export const statsFor = (value, inputText, outputText) => ({
  from: formatBytes(byteSize(inputText)),
  to: formatBytes(byteSize(outputText)),
  keys: countKeys(value),
  depth: depthOf(value),
  lines: outputText ? outputText.split('\n').length : 0
});

// UTF-8 safe base64url for share links.
export const encodeShare = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeShare = (encoded) => {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

export const SAMPLE_JSON = `{
  "id": "ord_1042",
  "created": "2026-11-14T09:32:11Z",
  "customer": {
    "name": "Anjali Rao",
    "email": "anjali@example.com",
    "vip": true
  },
  "items": [
    { "sku": "KB-01", "name": "Mechanical keyboard", "qty": 1, "price": 4499 },
    { "sku": "CB-07", "name": "USB-C cable", "qty": 2, "price": 349 }
  ],
  "shipping": { "city": "Bengaluru", "pin": "560001", "free": false },
  "total": 5197,
  "notes": null
}`;
