import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { xlsxToRows } from '../shared/xlsx';
import { sanitizeWinAnsi } from '../shared/text';

const PAGE_W = 841.89; // A4 landscape reads better for wide sheets
const PAGE_H = 595.28;
const MARGIN = 36;
const CELL_PAD = 6;
const FONT_SIZE = 8.5;
const ROW_H = 13;

const ExcelToPdf = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { url, sheets, rows }

  const handleFile = (e) => {
    const f = e.target.files[0] || null;
    setResult(null);
    setError('');
    if (f && !/\.(xlsx|xls|csv)$/i.test(f.name)) {
      setError('Upload an .xlsx, .xls or .csv file.');
      setFile(null);
    } else {
      setFile(f);
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const sheets = /\.csv$/i.test(file.name)
        ? [{ name: 'Sheet1', rows: parseCsv(await file.text()) }]
        : await xlsxToRows(await file.arrayBuffer());

      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const maxWidth = PAGE_W - MARGIN * 2;

      let totalRows = 0;
      for (const sheet of sheets) {
        const rows = normalizeRows(sheet.rows);
        totalRows += rows.length;
        if (!rows.length) continue;

        const columns = Math.max(...rows.map((r) => r.length), 1);
        const widths = columnWidths(rows, columns, font, bold, maxWidth);
        let page = doc.addPage([PAGE_W, PAGE_H]);
        let y = PAGE_H - MARGIN;

        page.drawText(sanitizeWinAnsi(sheet.name).slice(0, 80), {
          x: MARGIN, y: y - 12, size: 12, font: bold, color: rgb(0.16, 0.16, 0.22)
        });
        y -= 24;

        const newPage = () => {
          page = doc.addPage([PAGE_W, PAGE_H]);
          y = PAGE_H - MARGIN;
        };

        rows.forEach((row, rowIndex) => {
          if (y - ROW_H < MARGIN) newPage();
          let x = MARGIN;
          row.forEach((cell, col) => {
            const w = widths[col] || 40;
            const text = truncate(sanitizeWinAnsi(cell), widths[col] - CELL_PAD * 2, rowIndex === 0 ? bold : font);
            if (rowIndex === 0) {
              page.drawRectangle({ x, y: y - ROW_H, width: w, height: ROW_H, color: rgb(0.94, 0.93, 1) });
            }
            page.drawRectangle({
              x, y: y - ROW_H, width: w, height: ROW_H,
              borderColor: rgb(0.84, 0.84, 0.88), borderWidth: 0.4
            });
            page.drawText(text, {
              x: x + CELL_PAD, y: y - ROW_H + 4, size: FONT_SIZE,
              font: rowIndex === 0 ? bold : font,
              color: rgb(0.12, 0.12, 0.16)
            });
            x += w;
          });
          y -= ROW_H;
        });
      }

      if (!doc.getPageCount()) throw new Error('The spreadsheet has no data to convert.');
      doc.setTitle(file.name.replace(/\.(xlsx|xls|csv)$/i, ''));
      doc.setProducer('3toOne');
      doc.setCreator('3toOne');
      const outBytes = await doc.save({ useObjectStreams: true });
      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(new Blob([outBytes], { type: 'application/pdf' })),
        sheets: sheets.length,
        rows: totalRows
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not convert this spreadsheet.');
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${file.name.replace(/\.(xlsx|xls|csv)$/i, '')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout title="Excel to PDF" description="Lay each sheet out as a clean, paginated PDF table — .xlsx, .xls and .csv.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Spreadsheet file</label>
          <input
            className="tool-input"
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleFile}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Converting…' : 'Convert to PDF'}
          </button>
          {result && <button className="tool-btn" onClick={download}>Download PDF</button>}
        </div>

        {result && (
          <p className="form-note">
            {result.sheets} sheet{result.sheets > 1 ? 's' : ''} · {result.rows} rows exported on A4 landscape pages.
          </p>
        )}
      </div>
    </ToolLayout>
  );
};

const normalizeRows = (rows) => {
  const cleaned = rows.map((r) => r.map((c) => String(c ?? '')));
  while (cleaned.length && cleaned[cleaned.length - 1].every((c) => !c.trim())) cleaned.pop();
  return cleaned;
};

const columnWidths = (rows, columns, font, bold, maxWidth) => {
  const widths = [];
  for (let c = 0; c < columns; c++) {
    let widest = 30;
    rows.slice(0, 200).forEach((row, r) => {
      const text = sanitizeWinAnsi(row[c] || '');
      const w = (r === 0 ? bold : font).widthOfTextAtSize(text, FONT_SIZE) + CELL_PAD * 2;
      widest = Math.max(widest, Math.min(w, 260));
    });
    widths.push(widest);
  }
  const total = widths.reduce((a, b) => a + b, 0);
  if (total > maxWidth) {
    const k = maxWidth / total;
    return widths.map((w) => Math.max(28, w * k));
  }
  return widths;
};

const truncate = (text, width, font) => {
  if (font.widthOfTextAtSize(text, FONT_SIZE) <= width) return text;
  let out = text;
  while (out.length && font.widthOfTextAtSize(`${out}…`, FONT_SIZE) > width) out = out.slice(0, -1);
  return `${out}…`;
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
};

export default ExcelToPdf;
