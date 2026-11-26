import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { textItemsToRows, rowsToXlsxBytes } from '../shared/xlsx';
import { saveBytes, baseName } from '../shared/download';

const PdfToExcel = () => {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sheets, setSheets] = useState([]); // [{ name, rows }]

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setSheets([]);
    setError('');
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: bytes.slice() });
      const pdf = await task.promise;

      const result = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const rows = textItemsToRows(content.items);
        result.push({ name: `Page ${i}`, rows });
        page.cleanup();
      }
      await task.destroy();

      const totalRows = result.reduce((n, s) => n + s.rows.length, 0);
      if (!totalRows) {
        setError('No selectable text found — this PDF is probably scanned. Try OCR PDF first.');
        return;
      }
      setSheets(result);
    } catch (err) {
      console.error(err);
      setError('Could not read this PDF.');
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!sheets.length) return;
    const bytes = await rowsToXlsxBytes(sheets);
    saveBytes(bytes, `${baseName(file.name, 'pdf')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  return (
    <ToolLayout title="PDF to Excel" description="Turn PDF text and tables into a real .xlsx workbook — one sheet per page.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">PDF file</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Extracting…' : 'Extract to Excel'}
          </button>
          {sheets.length > 0 && <button className="tool-btn" onClick={download}>Download .xlsx</button>}
        </div>

        {sheets.length > 0 && (
          <div className="text-output">
            <p className="form-note">
              {sheets.reduce((n, s) => n + s.rows.length, 0)} rows across {sheets.length} sheet{sheets.length > 1 ? 's' : ''} —
              columns come from the text positions on each page.
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <tbody>
                  {sheets[0].rows.slice(0, 25).map((row, r) => (
                    <tr key={r}>
                      {row.map((cell, c) => <td key={c}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToExcel;
