import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const joinLineParts = (parts, size) => {
  let text = '';
  let prevEnd = null;
  for (const p of parts) {
    if (prevEnd !== null && p.x - prevEnd > size * 0.3) text += ' ';
    text += p.text;
    prevEnd = p.x + (p.width || 0);
  }
  return text;
};

const extractParagraphs = (pages) => {
  const allLines = [];
  for (const items of pages) {
    const lines = [];
    let cur = null;
    for (const it of items) {
      if (!it.str) continue;
      const y = it.transform[5];
      const x = it.transform[4];
      const size = Math.abs(it.transform[3]) || it.height || 12;
      if (!cur || Math.abs(cur.y - y) > 2) {
        cur = { y, parts: [{ x, text: it.str, width: it.width, size }] };
        lines.push(cur);
      } else {
        cur.parts.push({ x, text: it.str, width: it.width, size });
      }
    }
    for (const line of lines) {
      line.parts.sort((a, b) => a.x - b.x);
      line.size = Math.max(...line.parts.map((p) => p.size));
      line.text = joinLineParts(line.parts, line.size).trim();
      if (line.text) allLines.push(line);
    }
  }

  const sizeCounts = {};
  for (const l of allLines) {
    const bucket = Math.round(l.size);
    sizeCounts[bucket] = (sizeCounts[bucket] || 0) + l.text.length;
  }
  const bodySize =
    Number(Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]) || 12;

  const paragraphs = [];
  let para = null;
  for (const line of allLines) {
    const gap = para ? Math.abs(para.lastY - line.y) : Infinity;
    if (!para || gap > line.size * 1.8) {
      para = { lines: [line], lastY: line.y, size: line.size };
      paragraphs.push(para);
    } else {
      para.lines.push(line);
      para.lastY = line.y;
      para.size = Math.max(para.size, line.size);
    }
  }

  return { paragraphs, bodySize };
};

const PdfToWord = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, size, pages, words }

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: srcBytes.slice() }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items);
        page.cleanup();
      }
      const pageCount = pdf.numPages;
      await pdf.destroy();

      const { paragraphs, bodySize } = extractParagraphs(pages);
      if (!paragraphs.length) {
        setError(
          'No selectable text found — this looks like a scanned PDF. Scanned files need OCR, which this tool does not support yet.'
        );
        return;
      }

      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      const children = [];
      let words = 0;
      for (const para of paragraphs) {
        const text = para.lines.map((l) => l.text).join(' ');
        words += text.split(/\s+/).filter(Boolean).length;
        const singleLine = para.lines.length === 1;
        let heading = null;
        if (singleLine && para.size >= bodySize * 1.45) heading = HeadingLevel.HEADING_1;
        else if (singleLine && para.size >= bodySize * 1.18) heading = HeadingLevel.HEADING_2;
        if (heading) {
          children.push(new Paragraph({ heading, children: [new TextRun(text)] }));
        } else {
          children.push(new Paragraph({ children: [new TextRun(text)] }));
        }
      }

      const doc = new Document({
        creator: '3toOne',
        title: file.name.replace(/\.pdf$/i, ''),
        sections: [{ children }]
      });
      const outBytes = await Packer.toBlob(doc);

      if (result) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(outBytes),
        size: outBytes.size,
        pages: pageCount,
        words
      });
    } catch (err) {
      console.error(err);
      setError('Could not convert this PDF — it may be corrupted, encrypted, or too large for browser memory.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.pdf$/i, '')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="PDF to Word" description="Convert PDF files into editable Word (.docx) documents entirely in your browser.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {file && !result && (
          <p className="form-note">Original size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Converting…' : 'Convert to Word'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download .docx</button>}
        </div>

        {result && (
          <div className="control-row stats-row">
            <div className="stat-card"><div className="stat-value">{result.pages}</div><div className="stat-label">Pages</div></div>
            <div className="stat-card"><div className="stat-value">{result.words.toLocaleString()}</div><div className="stat-label">Words</div></div>
            <div className="stat-card"><div className="stat-value">{(result.size / 1024).toFixed(0)} KB</div><div className="stat-label">Docx size</div></div>
          </div>
        )}

        {result && (
          <p className="form-note">
            Text and headings are preserved so you can edit the document. Complex layouts, tables, and images from the original PDF are not carried over in this version.
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToWord;
