/** Build a real .xlsx workbook from plain row arrays. */
export async function rowsToXlsxBytes(sheets) {
  const XLSX = await import('xlsx');
  const book = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const name = String(sheet.name || 'Sheet1').replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Sheet1';
    const rows = sheet.rows.length ? sheet.rows : [['']];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const widths = rows.reduce((acc, row) => {
      row.forEach((cell, i) => {
        const len = String(cell ?? '').length;
        acc[i] = Math.max(acc[i] || 8, Math.min(60, len + 2));
      });
      return acc;
    }, []);
    ws['!cols'] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(book, ws, name);
  }
  return XLSX.write(book, { bookType: 'xlsx', type: 'array' });
}

/** Read the first sheet of an uploaded spreadsheet into rows of strings. */
export async function xlsxToRows(arrayBuffer) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheets = [];
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
    sheets.push({ name, rows });
  }
  return sheets;
}

/** Group absolutely positioned PDF text items into rows (top to bottom). */
export function textItemsToRows(items, tolerance = 3) {
  const rows = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    const y = item.transform[5];
    const x = item.transform[4];
    let row = rows.find((r) => Math.abs(r.y - y) <= tolerance);
    if (!row) {
      row = { y, cells: [] };
      rows.push(row);
    }
    row.cells.push({ x, text: item.str, width: item.width });
  }
  rows.sort((a, b) => b.y - a.y);
  return rows
    .map((r) => {
      r.cells.sort((a, b) => a.x - b.x);
      // Merge runs that sit on the same baseline without a visible gap.
      const merged = [];
      for (const cell of r.cells) {
        const last = merged[merged.length - 1];
        if (last && cell.x - last.end < 6) {
          last.text += cell.text;
          last.end = cell.x + (cell.width || cell.text.length * 4);
        } else {
          merged.push({ text: cell.text, end: cell.x + (cell.width || cell.text.length * 4) });
        }
      }
      return merged.map((c) => c.text.trim());
    })
    .filter((cells) => cells.some((c) => c));
}
