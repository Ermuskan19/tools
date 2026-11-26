import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { extractPageTexts } from '../shared/pdfjs';
import { diffLines, diffStats } from '../shared/diff';
import { saveBytes, baseName } from '../shared/download';
import { sanitizeWinAnsi } from '../shared/text';

const ComparePdfs = () => {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { rows, stats, textA, textB }
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);

  const handleFile = (e, which) => {
    const f = e.target.files[0];
    if (!f) return;
    if (which === 'a') setFileA(f);
    else setFileB(f);
    setResult(null);
    setError('');
    e.target.value = '';
  };

  const compare = async () => {
    if (!fileA || !fileB) { setError('Upload both PDFs.'); return; }
    setBusy(true);
    setError('');
    try {
      const [pagesA, pagesB] = await Promise.all([extractPageTexts(fileA), extractPageTexts(fileB)]);
      const textA = pagesA.join('\n');
      const textB = pagesB.join('\n');
      if (!textA.trim() && !textB.trim()) {
        setError('Neither PDF has selectable text — scanned files need OCR first.');
        return;
      }
      const rows = diffLines(textA, textB);
      setResult({ rows, stats: diffStats(rows), textA, textB, pagesA: pagesA.length, pagesB: pagesB.length });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not compare these PDFs.');
    } finally {
      setBusy(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Courier);
    const bold = await doc.embedFont(StandardFonts.CourierBold);
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const M = 42;
    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - M;

    page.drawText('PDF comparison report', { x: M, y: y - 16, size: 16, font: bold, color: rgb(0.12, 0.1, 0.2) });
    y -= 34;
    page.drawText(`A: ${fileA.name}`, { x: M, y, size: 9, font });
    y -= 12;
    page.drawText(`B: ${fileB.name}`, { x: M, y, size: 9, font });
    y -= 12;
    page.drawText(
      `${result.stats.added} added · ${result.stats.removed} removed · ${result.stats.same} unchanged lines`,
      { x: M, y, size: 9, font: bold }
    );
    y -= 20;

    const size = 8;
    const lineH = 10.5;
    const wrap = (text) => {
      const clean = sanitizeWinAnsi(text);
      const max = Math.floor((PAGE_W - M * 2) / (size * 0.6));
      if (clean.length <= max) return [clean];
      const out = [];
      for (let i = 0; i < clean.length; i += max) out.push(clean.slice(i, i + max));
      return out;
    };

    for (const row of result.rows) {
      if (showOnlyChanges && row.type === 'equal') continue;
      const prefix = row.type === 'added' ? '+ ' : row.type === 'removed' ? '- ' : '  ';
      const color = row.type === 'added' ? rgb(0.05, 0.45, 0.2) : row.type === 'removed' ? rgb(0.7, 0.1, 0.15) : rgb(0.25, 0.25, 0.3);
      for (const line of wrap(prefix + row.text)) {
        if (y - lineH < M) {
          page = doc.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - M;
        }
        page.drawText(line, { x: M, y, size, font, color });
        y -= lineH;
      }
    }

    doc.setTitle('PDF comparison');
    doc.setProducer('3toOne');
    saveBytes(await doc.save({ useObjectStreams: true }), `${baseName(fileA.name, 'pdf')}-vs-${baseName(fileB.name, 'pdf')}-diff.pdf`);
  };

  const rows = result ? (showOnlyChanges ? result.rows.filter((r) => r.type !== 'equal') : result.rows) : [];

  return (
    <ToolLayout title="Compare PDFs" description="See exactly which lines changed between two PDFs and download a marked report.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF A (original)</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'a')} />
          <label className="tool-label">PDF B (revised)</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'b')} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={compare} disabled={busy || !fileA || !fileB}>
            {busy ? 'Comparing…' : 'Compare'}
          </button>
          {result && <button className="tool-btn" onClick={downloadReport}>Download diff report (PDF)</button>}
        </div>

        {result && (
          <>
            <div className="control-row stats-row">
              <div className="stat-card"><div className="stat-value">{result.stats.added}</div><div className="stat-label">Lines added</div></div>
              <div className="stat-card"><div className="stat-value">{result.stats.removed}</div><div className="stat-label">Lines removed</div></div>
              <div className="stat-card"><div className="stat-value">{result.stats.same}</div><div className="stat-label">Unchanged</div></div>
              <div className="stat-card"><div className="stat-value">{result.pagesA} → {result.pagesB}</div><div className="stat-label">Pages</div></div>
            </div>

            <label className="tool-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={showOnlyChanges} onChange={(e) => setShowOnlyChanges(e.target.checked)} />
              Show only changed lines
            </label>

            {!rows.length && <p className="form-note">No text differences found — both PDFs have identical text.</p>}

            {rows.length > 0 && (
              <div className="diff-view">
                {rows.map((row, i) => (
                  <div key={i} className={`diff-line diff-${row.type}`}>
                    <span className="diff-mark">{row.type === 'added' ? '+' : row.type === 'removed' ? '−' : ' '}</span>
                    <span>{row.text || '\u00a0'}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default ComparePdfs;
