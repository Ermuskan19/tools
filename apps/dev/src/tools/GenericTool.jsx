import { useState, useRef, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { devToolsBySlug } from '../data/devTools';

const downloadText = (filename, text, mime = 'text/plain') => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const copyText = async (text) => {
  try { await navigator.clipboard.writeText(text); alert('Copied'); } catch { /* ignore */ }
};

const TA = ({ value, onChange, placeholder, rows = 8 }) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ width: '100%', fontFamily: 'monospace', fontSize: 13 }} />
);

function LoadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ---------- tool implementations ----------

function JsonViewer() {
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);
  const renderTree = (v, depth = 0) => {
    if (v === null) return <span style={{ color: '#999' }}>null</span>;
    if (typeof v !== 'object') {
      const color = typeof v === 'string' ? '#22c55e' : typeof v === 'number' ? '#3b82f6' : '#f59e0b';
      return <span style={{ color }}>{JSON.stringify(v)}</span>;
    }
    if (Array.isArray(v)) {
      return (
        <details open={depth < 2}>
          <summary>[{v.length}]</summary>
          <div style={{ marginLeft: 16 }}>
            {v.map((x, i) => <div key={i}>{i}: {renderTree(x, depth + 1)}</div>)}
          </div>
        </details>
      );
    }
    const keys = Object.keys(v);
    return (
      <details open={depth < 2}>
        <summary>{`{${keys.length}}`}</summary>
        <div style={{ marginLeft: 16 }}>
          {keys.map((k) => <div key={k}><b>{k}</b>: {renderTree(v[k], depth + 1)}</div>)}
        </div>
      </details>
    );
  };
  const parse = () => {
    try { setData(JSON.parse(input)); setErr(''); } catch (e) { setErr(e.message); setData(null); }
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste JSON' />
      <div style={{ marginTop: 8 }}>
        <button onClick={parse} className="btn primary">View</button>
      </div>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}
      {data !== null && <div style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 13 }}>{renderTree(data)}</div>}
    </div>
  );
}

function JsonToCsv() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const run = () => {
    try {
      const data = JSON.parse(input);
      const arr = Array.isArray(data) ? data : [data];
      if (!arr.length) { setOut(''); return; }
      const keys = Object.keys(arr[0]);
      const rows = [keys.join(',')];
      arr.forEach((o) => {
        rows.push(keys.map((k) => {
          const v = o[k];
          const s = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(','));
      });
      setOut(rows.join('\n'));
      setErr('');
    } catch (e) { setErr(e.message); setOut(''); }
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste JSON array of objects' />
      <div style={{ marginTop: 8 }}><button onClick={run} className="btn primary">Convert</button></div>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}
      {out && <><TA value={out} onChange={() => {}} rows={8} /><div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button> <button onClick={() => downloadText('data.csv', out, 'text/csv')} className="btn ghost">Download CSV</button></div></>}
    </div>
  );
}

function XmlFormatter() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const run = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      const err = doc.querySelector('parsererror');
      if (err) throw new Error(err.textContent);
      const ser = new XMLSerializer();
      // pretty print via manual
      let xml = ser.serializeToString(doc);
      // simple indent
      xml = xml.replace(/></g, '>\n<');
      const lines = xml.split('\n');
      let indent = 0;
      const pretty = lines.map((l) => {
        const t = l.trim();
        if (!t) return '';
        if (t.startsWith('</')) indent = Math.max(0, indent - 1);
        const line = '  '.repeat(indent) + t;
        if (t.startsWith('<') && !t.startsWith('</') && !t.endsWith('/>') && !t.includes('</')) indent++;
        return line;
      }).join('\n');
      setOut(pretty);
    } catch (e) { setOut('Error: ' + e.message); }
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste XML' />
      <div style={{ marginTop: 8 }}><button onClick={run} className="btn primary">Format</button></div>
      <TA value={out} onChange={() => {}} />
    </div>
  );
}

function ImageToBase64() {
  const [out, setOut] = useState('');
  const [preview, setPreview] = useState('');
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setOut(r.result); setPreview(r.result); };
    r.readAsDataURL(f);
  };
  return (
    <div>
      <input type="file" accept="image/*" onChange={onFile} />
      {preview && <img src={preview} alt="preview" style={{ maxWidth: 240, marginTop: 8 }} />}
      {out && <><TA value={out} onChange={() => {}} /><div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button></div></>}
    </div>
  );
}

function SqlFormatter() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const run = () => {
    const keywords = ['SELECT','FROM','WHERE','AND','OR','JOIN','LEFT','RIGHT','INNER','OUTER','ON','GROUP','BY','ORDER','HAVING','LIMIT','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','AS','DISTINCT','UNION','ALL'];
    let s = input.replace(/\s+/g, ' ').trim();
    keywords.forEach((k) => {
      const re = new RegExp('\\b' + k + '\\b', 'gi');
      s = s.replace(re, '\n' + k);
    });
    setOut(s.trim());
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste SQL' />
      <div style={{ marginTop: 8 }}><button onClick={run} className="btn primary">Format</button></div>
      <TA value={out} onChange={() => {}} />
    </div>
  );
}

function Minifier({ kind }) {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const run = () => {
    let s = input;
    if (kind === 'html') {
      s = s.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
    } else if (kind === 'css') {
      s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim();
    } else {
      // js: remove // and /* */ comments (naive) and collapse whitespace
      s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();
    }
    setOut(s);
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder={`Paste ${kind.toUpperCase()}`} />
      <div style={{ marginTop: 8 }}><button onClick={run} className="btn primary">Minify</button></div>
      <TA value={out} onChange={() => {}} />
      {out && <div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button></div>}
    </div>
  );
}

function UrlCodec() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Text or URL' />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={() => setOut(encodeURIComponent(input))} className="btn primary">Encode</button>
        <button onClick={() => { try { setOut(decodeURIComponent(input)); } catch (e) { setOut('Error: ' + e.message); } }} className="btn ghost">Decode</button>
      </div>
      <TA value={out} onChange={() => {}} />
    </div>
  );
}

function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const run = () => {
    let s = input;
    s = s.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    s = s.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    s = s.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    s = s.replace(/`(.*?)`/g, '<code>$1</code>');
    s = s.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    s = s.replace(/\n\n/g, '</p><p>');
    s = '<p>' + s + '</p>';
    setOut(s);
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste Markdown' />
      <div style={{ marginTop: 8 }}><button onClick={run} className="btn primary">Convert</button></div>
      <TA value={out} onChange={() => {}} />
    </div>
  );
}

function ColorGradient() {
  const [c1, setC1] = useState('#6366f1');
  const [c2, setC2] = useState('#22c55e');
  const [angle, setAngle] = useState(90);
  const css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>Color 1 <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} /></label>
        <label>Color 2 <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} /></label>
        <label>Angle <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: 70 }} /></label>
      </div>
      <div style={{ width: '100%', height: 120, marginTop: 12, borderRadius: 8, ...Object.fromEntries(css.replace('background: ', '').replace(';', '').split(': ').map((x, i) => i === 0 ? ['background', x] : null).filter(Boolean)) }} />
      <pre style={{ marginTop: 12 }}>{css}</pre>
      <button onClick={() => copyText(css)} className="btn ghost">Copy CSS</button>
    </div>
  );
}

function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const matches = useMemo(() => {
    if (!pattern) return [];
    try {
      const re = new RegExp(pattern, flags);
      const out = [];
      let m;
      if (flags.includes('g')) {
        while ((m = re.exec(text)) !== null) { out.push(m[0]); if (!re.global) break; }
      } else {
        m = re.exec(text); if (m) out.push(m[0]);
      }
      return out;
    } catch { return []; }
  }, [pattern, flags, text]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" style={{ flex: 1 }} />
        <input value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="flags" style={{ width: 60 }} />
      </div>
      <TA value={text} onChange={setText} placeholder='Test string' />
      <p>Matches: {matches.length}</p>
      <ul>{matches.map((m, i) => <li key={i}><code>{m}</code></li>)}</ul>
    </div>
  );
}

function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [out, setOut] = useState('');
  const gen = () => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(crypto.randomUUID());
    }
    setOut(arr.join('\n'));
  };
  return (
    <div>
      <label>Count <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} /></label>
      <div style={{ marginTop: 8 }}><button onClick={gen} className="btn primary">Generate</button></div>
      <TA value={out} onChange={() => {}} />
      {out && <div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button></div>}
    </div>
  );
}

function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const out = `<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${image}" />`;
  return (
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', marginBottom: 6 }} />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={2} style={{ width: '100%', marginBottom: 6 }} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" style={{ width: '100%', marginBottom: 6 }} />
      <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" style={{ width: '100%', marginBottom: 6 }} />
      <TA value={out} onChange={() => {}} />
      <div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button></div>
    </div>
  );
}

function SchemaGenerator() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const obj = { '@context': 'https://schema.org', '@type': 'WebSite', name, description: desc, url };
  const out = JSON.stringify(obj, null, 2);
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Site name" style={{ width: '100%', marginBottom: 6 }} />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={2} style={{ width: '100%', marginBottom: 6 }} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" style={{ width: '100%', marginBottom: 6 }} />
      <TA value={out} onChange={() => {}} />
      <div style={{ marginTop: 8 }}><button onClick={() => copyText(`<script type="application/ld+json">\n${out}\n</script>`)} className="btn ghost">Copy script tag</button></div>
    </div>
  );
}

function OpenGraphChecker() {
  const [input, setInput] = useState('');
  const tags = useMemo(() => {
    if (typeof DOMParser === 'undefined') return [];
    const doc = new DOMParser().parseFromString(input, 'text/html');
    const metas = Array.from(doc.querySelectorAll('meta'));
    return metas.filter((m) => m.getAttribute('property')?.startsWith('og:') || m.getAttribute('name')?.startsWith('twitter:')).map((m) => ({
      key: m.getAttribute('property') || m.getAttribute('name'),
      value: m.getAttribute('content')
    }));
  }, [input]);
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste HTML' />
      <ul style={{ marginTop: 12 }}>{tags.map((t, i) => <li key={i}><b>{t.key}</b>: {t.value}</li>)}</ul>
      {tags.length === 0 && input && <p>No OG/Twitter tags found.</p>}
    </div>
  );
}

function KeywordDensity() {
  const [input, setInput] = useState('');
  const stats = useMemo(() => {
    const words = input.toLowerCase().match(/\b[a-z0-9']+\b/g) || [];
    const total = words.length;
    const counts = {};
    words.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w, c]) => ({ w, c, pct: total ? (c / total * 100).toFixed(2) : 0 }));
  }, [input]);
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste text' />
      <table style={{ marginTop: 12, width: '100%', fontSize: 13 }}>
        <thead><tr><th align="left">Word</th><th>Count</th><th>%</th></tr></thead>
        <tbody>{stats.map((s) => <tr key={s.w}><td>{s.w}</td><td>{s.c}</td><td>{s.pct}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function SitemapGenerator() {
  const [input, setInput] = useState('');
  const [base, setBase] = useState('https://example.com');
  const out = useMemo(() => {
    const urls = input.split('\n').map((s) => s.trim()).filter(Boolean);
    const entries = urls.map((u) => `  <url>\n    <loc>${base.replace(/\/$/, '')}/${u.replace(/^\//, '')}</loc>\n  </url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  }, [input, base]);
  return (
    <div>
      <input value={base} onChange={(e) => setBase(e.target.value)} placeholder="Base URL" style={{ width: '100%', marginBottom: 6 }} />
      <TA value={input} onChange={setInput} placeholder='One path per line' />
      <TA value={out} onChange={() => {}} />
      <div style={{ marginTop: 8 }}><button onClick={() => downloadText('sitemap.xml', out, 'application/xml')} className="btn ghost">Download</button></div>
    </div>
  );
}

function RobotsGenerator() {
  const [allow, setAllow] = useState('/');
  const [disallow, setDisallow] = useState('/admin/');
  const [sitemap, setSitemap] = useState('');
  const out = `User-agent: *\nAllow: ${allow}\nDisallow: ${disallow}\n${sitemap ? `Sitemap: ${sitemap}` : ''}`.trim();
  return (
    <div>
      <input value={allow} onChange={(e) => setAllow(e.target.value)} placeholder="Allow" style={{ width: '100%', marginBottom: 6 }} />
      <input value={disallow} onChange={(e) => setDisallow(e.target.value)} placeholder="Disallow" style={{ width: '100%', marginBottom: 6 }} />
      <input value={sitemap} onChange={(e) => setSitemap(e.target.value)} placeholder="Sitemap URL" style={{ width: '100%', marginBottom: 6 }} />
      <TA value={out} onChange={() => {}} />
      <div style={{ marginTop: 8 }}><button onClick={() => copyText(out)} className="btn ghost">Copy</button></div>
    </div>
  );
}

function SpeedChecker() {
  const [url, setUrl] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      await fetch(url, { mode: 'no-cors' });
      const t1 = performance.now();
      setRes({ ok: true, ms: Math.round(t1 - t0) });
    } catch (e) {
      setRes({ ok: false, err: e.message });
    }
    setLoading(false);
  };
  return (
    <div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" style={{ width: '100%', marginBottom: 6 }} />
      <button onClick={run} disabled={loading} className="btn primary">{loading ? 'Checking…' : 'Check'}</button>
      {res && <p style={{ marginTop: 8 }}>{res.ok ? `Loaded in ~${res.ms} ms (approx, no-cors)` : `Error: ${res.err}`}</p>}
      <p style={{ fontSize: 12, color: 'var(--mut)' }}>Note: cross-origin restrictions may limit accuracy.</p>
    </div>
  );
}

function BrokenLinkChecker() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    const urls = input.match(/https?:\/\/[^\s"']+/g) || [];
    setLoading(true);
    const out = [];
    for (const u of urls) {
      try {
        await fetch(u, { mode: 'no-cors' });
        out.push({ u, status: 'reachable (no-cors)' });
      } catch (e) {
        out.push({ u, status: 'error: ' + e.message });
      }
    }
    setResults(out);
    setLoading(false);
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste HTML or list of URLs' />
      <div style={{ marginTop: 8 }}><button onClick={run} disabled={loading} className="btn primary">{loading ? 'Checking…' : 'Check'}</button></div>
      <ul style={{ marginTop: 8 }}>{results.map((r, i) => <li key={i}>{r.u} — {r.status}</li>)}</ul>
    </div>
  );
}

function DomainAuthority() {
  const [domain, setDomain] = useState('');
  const [info, setInfo] = useState(null);
  const run = async () => {
    try {
      const d = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const r = await fetch(`https://dns.google/resolve?name=${d}&type=A`);
      const j = await r.json();
      setInfo(j);
    } catch (e) { setInfo({ error: e.message }); }
  };
  return (
    <div>
      <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" style={{ width: '100%', marginBottom: 6 }} />
      <button onClick={run} className="btn primary">Lookup</button>
      {info && <pre style={{ marginTop: 8, fontSize: 12 }}>{JSON.stringify(info, null, 2)}</pre>}
    </div>
  );
}

function SslChecker() {
  const [url, setUrl] = useState('');
  const [res, setRes] = useState(null);
  const run = async () => {
    try {
      const u = url.startsWith('http') ? url : 'https://' + url;
      await fetch(u, { mode: 'no-cors' });
      setRes({ ok: true, msg: 'HTTPS endpoint reachable' });
    } catch (e) { setRes({ ok: false, msg: e.message }); }
  };
  return (
    <div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" style={{ width: '100%', marginBottom: 6 }} />
      <button onClick={run} className="btn primary">Check</button>
      {res && <p style={{ marginTop: 8, color: res.ok ? 'green' : 'red' }}>{res.msg}</p>}
      <p style={{ fontSize: 12, color: 'var(--mut)' }}>Detailed cert inspection requires server-side; this checks reachability.</p>
    </div>
  );
}

function WhoisLookup() {
  const [domain, setDomain] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      const d = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const r = await fetch(`https://rdap.org/domain/${d}`);
      const j = await r.json();
      setInfo(j);
    } catch (e) { setInfo({ error: e.message }); }
    setLoading(false);
  };
  return (
    <div>
      <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" style={{ width: '100%', marginBottom: 6 }} />
      <button onClick={run} disabled={loading} className="btn primary">{loading ? 'Looking up…' : 'Lookup'}</button>
      {info && <pre style={{ marginTop: 8, fontSize: 12, maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(info, null, 2)}</pre>}
    </div>
  );
}

function RedirectChecker() {
  const [url, setUrl] = useState('');
  const [res, setRes] = useState(null);
  const run = async () => {
    try {
      const r = await fetch(url, { redirect: 'follow', mode: 'no-cors' });
      setRes({ final: r.url || url, type: r.type });
    } catch (e) { setRes({ error: e.message }); }
  };
  return (
    <div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" style={{ width: '100%', marginBottom: 6 }} />
      <button onClick={run} className="btn primary">Check</button>
      {res && <pre style={{ marginTop: 8, fontSize: 12 }}>{JSON.stringify(res, null, 2)}</pre>}
      <p style={{ fontSize: 12, color: 'var(--mut)' }}>Cross-origin limits may hide final URL.</p>
    </div>
  );
}

function SeoAudit() {
  const [input, setInput] = useState('');
  const report = useMemo(() => {
    if (typeof DOMParser === 'undefined') return null;
    if (!input.trim()) return null;
    const doc = new DOMParser().parseFromString(input, 'text/html');
    const checks = [];
    const title = doc.querySelector('title')?.textContent || '';
    checks.push({ label: 'Title present', pass: !!title, detail: title ? `${title.length} chars` : 'missing' });
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    checks.push({ label: 'Meta description', pass: !!desc, detail: desc ? `${desc.length} chars` : 'missing' });
    const h1s = doc.querySelectorAll('h1');
    checks.push({ label: 'Single H1', pass: h1s.length === 1, detail: `${h1s.length} h1` });
    const imgs = doc.querySelectorAll('img');
    const noAlt = Array.from(imgs).filter((i) => !i.getAttribute('alt')).length;
    checks.push({ label: 'All images have alt', pass: noAlt === 0, detail: `${noAlt} missing` });
    const links = doc.querySelectorAll('a');
    checks.push({ label: 'Links present', pass: links.length > 0, detail: `${links.length} links` });
    return checks;
  }, [input]);
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='Paste HTML' />
      {report && (
        <ul style={{ marginTop: 12 }}>
          {report.map((c) => <li key={c.label} style={{ color: c.pass ? 'green' : 'red' }}>{c.pass ? '✓' : '✗'} {c.label} — {c.detail}</li>)}
        </ul>
      )}
    </div>
  );
}

function FaviconGenerator() {
  const [preview, setPreview] = useState('');
  const [src, setSrc] = useState(null);
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { setPreview(r.result); setSrc(r.result); };
    r.readAsDataURL(f);
  };
  const downloadSize = (size) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      c.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `favicon-${size}x${size}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = src;
  };
  return (
    <div>
      <input type="file" accept="image/*" onChange={onFile} />
      {preview && <img src={preview} alt="preview" style={{ maxWidth: 120, marginTop: 8 }} />}
      {src && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[16, 32, 48, 64, 128, 180, 192, 512].map((s) => (
            <button key={s} onClick={() => downloadSize(s)} className="btn ghost">Download {s}x{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function CsvToExcel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      await LoadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
      const XLSX = window.XLSX;
      const ws = XLSX.utils.aoa_to_sheet(input.split('\n').map((r) => r.split(',')));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'data.xlsx');
    } catch (e) { alert('Error: ' + e.message); }
    setLoading(false);
  };
  return (
    <div>
      <TA value={input} onChange={setInput} placeholder='CSV content' />
      <div style={{ marginTop: 8 }}><button onClick={run} disabled={loading} className="btn primary">{loading ? 'Working…' : 'Download XLSX'}</button></div>
    </div>
  );
}

function ExcelToCsv() {
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const onFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setLoading(true);
    try {
      await LoadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
      const XLSX = window.XLSX;
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      setOut(XLSX.utils.sheet_to_csv(ws));
    } catch (e) { setOut('Error: ' + e.message); }
    setLoading(false);
  };
  return (
    <div>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} />
      {loading && <p>Loading…</p>}
      <TA value={out} onChange={() => {}} />
      {out && <div style={{ marginTop: 8 }}><button onClick={() => downloadText('data.csv', out, 'text/csv')} className="btn ghost">Download CSV</button></div>}
    </div>
  );
}

function ZipCompressor() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const onFiles = (e) => setFiles(Array.from(e.target.files || []));
  const run = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      await LoadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
      const zip = new window.JSZip();
      for (const f of files) {
        zip.file(f.name, f);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'archive.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Error: ' + e.message); }
    setLoading(false);
  };
  return (
    <div>
      <input type="file" multiple onChange={onFiles} />
      <p style={{ marginTop: 6 }}>{files.length} files selected</p>
      <div style={{ marginTop: 8 }}><button onClick={run} disabled={loading || !files.length} className="btn primary">{loading ? 'Zipping…' : 'Create ZIP'}</button></div>
    </div>
  );
}

function FileConverterHub() {
  return (
    <div>
      <p>A hub linking every converter:</p>
      <ul>
        <li><Link to="/json-to-csv">JSON to CSV</Link></li>
        <li><Link to="/csv-to-excel">CSV to Excel</Link></li>
        <li><Link to="/excel-to-csv">Excel to CSV</Link></li>
        <li><Link to="/image-to-base64">Image to Base64</Link></li>
        <li><Link to="/base64">Base64 Encode/Decode</Link></li>
        <li><Link to="/markdown-to-html">Markdown to HTML</Link></li>
        <li><Link to="/xml-formatter">XML Formatter</Link></li>
      </ul>
    </div>
  );
}

const MAP = {
  'json-viewer': JsonViewer,
  'json-to-csv': JsonToCsv,
  'xml-formatter': XmlFormatter,
  'csv-to-excel': CsvToExcel,
  'excel-to-csv': ExcelToCsv,
  'image-to-base64': ImageToBase64,
  'sql-formatter': SqlFormatter,
  'zip-compressor': ZipCompressor,
  'file-converter': FileConverterHub,
  'html-minifier': () => <Minifier kind="html" />,
  'css-minifier': () => <Minifier kind="css" />,
  'js-minifier': () => <Minifier kind="js" />,
  'url-encoder-decoder': UrlCodec,
  'markdown-to-html': MarkdownToHtml,
  'color-gradient-css': ColorGradient,
  'regex-tester': RegexTester,
  'uuid-generator': UuidGenerator,
  'meta-tag-generator': MetaTagGenerator,
  'schema-markup-generator': SchemaGenerator,
  'open-graph-checker': OpenGraphChecker,
  'keyword-density-checker': KeywordDensity,
  'sitemap-generator': SitemapGenerator,
  'robots-txt-generator': RobotsGenerator,
  'website-speed-checker': SpeedChecker,
  'broken-link-checker': BrokenLinkChecker,
  'domain-authority-checker': DomainAuthority,
  'ssl-checker': SslChecker,
  'whois-lookup': WhoisLookup,
  'redirect-checker': RedirectChecker,
  'seo-audit-report': SeoAudit,
  'favicon-generator': FaviconGenerator,
};

export default function GenericTool() {
  const { slug } = useParams();
  const Comp = MAP[slug];
  if (!Comp) return <div>Tool not available.</div>;
  return <div className="gen-tool"><Comp /></div>;
}
