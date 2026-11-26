import { useState } from 'react';
import { ToolLayout } from '@zegnite/shared-ui';
import { loadPdfjs } from '../shared/pdfjs';
import { textItemsToRows, rowsToXlsxBytes } from '../shared/xlsx';
import { saveBytes, baseName } from '../shared/download';

const DATE_RE = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{2,4})/i;
const AMOUNT_RE = /^-?\(?[₹$]?\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\)?$/;
const IGNORE_RE = /^(date|particulars?|description|narration|details|debit|credit|withdrawal|deposit|balance|amount|dr|cr|chq|ref|value date)$/i;

const CATEGORY_RULES = [
  ['Salary', /salary|payroll|neft.*salary|wages/i],
  ['UPI / Transfer', /upi|imps|neft|rtgs|transfer|sent to|received from|paytm|phonepe|gpay/i],
  ['ATM / Cash', /atm|cash withdrawal|cash deposit|cash/i],
  ['Food & Dining', /swiggy|zomato|restaurant|cafe|food|hotel|dining/i],
  ['Shopping', /amazon|flipkart|myntra|ajio|mall|store|shop|mart/i],
  ['Bills & Utilities', /electricity|water bill|gas bill|broadband|recharge|postpaid|airtel|jio|vodafone|dth|bill pay/i],
  ['Rent', /rent|housing/i],
  ['Travel', /uber|ola|irctc|railway|flight|indigo|petrol|fuel|metro|bus/i],
  ['Fees & Charges', /charge|fee|gst|penalty|sms charge|annual/i],
  ['Interest', /interest/i],
  ['Investment', /mutual|sip|demat|zerodha|groww|insurance|lic/i],
  ['Medical', /hospital|pharmacy|medical|clinic|apollo|pharmeasy/i],
  ['Education', /school|college|tuition|course|exam|university/i]
];

const categorize = (text) => {
  for (const [label, re] of CATEGORY_RULES) if (re.test(text)) return label;
  return 'Other';
};

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/[₹$,\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const parseStatement = (rows) => {
  const headerIndex = rows.findIndex(
    (row) => row.filter((c) => /date|particular|description|narration|debit|credit|withdraw|deposit|balance|amount/i.test(c)).length >= 2
  );
  const header = headerIndex >= 0 ? rows[headerIndex] : [];
  const findCol = (re) => header.findIndex((c) => re.test(c));
  const dateCol = findCol(/date/i);
  const descCol = findCol(/particular|description|narration|details/i);
  const debitCol = findCol(/debit|withdraw|^dr$/i);
  const creditCol = findCol(/credit|deposit|^cr$/i);
  const balanceCol = findCol(/balance/i);

  const transactions = [];
  const body = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows;

  for (const row of body) {
    const cells = row.map((c) => String(c).trim()).filter(Boolean);
    if (!cells.length) continue;
    const joined = cells.join(' ');
    if (!DATE_RE.test(joined) && !/\d/.test(joined)) continue;
    if (/opening balance|closing balance|statement of/i.test(joined) && !DATE_RE.test(joined)) continue;

    const dateCell = dateCol >= 0 ? row[dateCol] : cells.find((c) => DATE_RE.test(c));
    const dateMatch = String(dateCell || joined).match(DATE_RE);
    if (!dateMatch) continue;

    let debit = debitCol >= 0 ? toNumber(row[debitCol] || '') : null;
    let credit = creditCol >= 0 ? toNumber(row[creditCol] || '') : null;
    const numbers = cells
      .filter((c) => AMOUNT_RE.test(c) && /\d/.test(c))
      .map(toNumber)
      .filter((n) => n !== null);

    if (debit === null && credit === null) {
      if (numbers.length >= 2) {
        // last number on the row is usually the running balance
        const balance = balanceCol >= 0 ? toNumber(row[balanceCol] || '') : numbers[numbers.length - 1];
        const amount = numbers.length > 1 ? numbers[numbers.length - 2] : numbers[0];
        if (/\bcr\b/i.test(joined)) credit = Math.abs(amount);
        else if (/\bdr\b/i.test(joined)) debit = Math.abs(amount);
        else {
          const explicitBalance = balanceCol >= 0 ? balance : null;
          if (explicitBalance === null) debit = Math.abs(amount);
          else credit = Math.abs(amount);
        }
      } else if (numbers.length === 1) {
        if (/\bcr\b/i.test(joined)) credit = Math.abs(numbers[0]);
        else debit = Math.abs(numbers[0]);
      }
    }

    const descriptionParts = cells.filter((c) => {
      if (c === dateMatch[0]) return false;
      if (IGNORE_RE.test(c)) return false;
      if (AMOUNT_RE.test(c) && /\d/.test(c)) return false;
      return !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(c);
    });
    const description = descriptionParts.join(' ').replace(/\s{2,}/g, ' ').trim();
    if (!description && debit === null && credit === null) continue;

    const amount = credit !== null && credit !== 0 ? credit : debit !== null ? -Math.abs(debit) : 0;
    transactions.push({
      date: dateMatch[0],
      description: description || '(no description)',
      amount,
      type: amount >= 0 ? 'Credit' : 'Debit',
      category: categorize(`${description} ${joined}`),
      balance: balanceCol >= 0 ? toNumber(row[balanceCol] || '') : null
    });
  }

  return transactions;
};

const BankStatementToExcel = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState([]);

  const handleFile = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    setTransactions([]);
    setError('');
    setNote('');
    if (f) {
      setName(baseName(f.name, 'pdf'));
      setBank('');
    }
    e.target.value = '';
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const task = pdfjs.getDocument({ data: bytes.slice() });
      const pdf = await task.promise;
      const rows = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        rows.push(...textItemsToRows(content.items));
        page.cleanup();
      }
      await task.destroy();

      if (!rows.length) {
        setError('No selectable text in this statement — scanned statements need OCR first (try OCR PDF).');
        return;
      }

      const parsed = parseStatement(rows);
      if (!parsed.length) {
        setError(
          'Could not recognise transaction rows. The statement may use a layout this parser does not understand — it works best with text-based statements.'
        );
        return;
      }
      setTransactions(parsed);
      const debits = parsed.filter((t) => t.amount < 0).length;
      setNote(`${parsed.length} transactions found (${debits} debits, ${parsed.length - debits} credits), auto-categorised.`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Statement extraction failed.');
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!transactions.length) return;
    const header = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Balance'];
    const rows = transactions.map((t) => [
      t.date, t.description, t.amount, t.type, t.category, t.balance ?? ''
    ]);

    const totals = {};
    for (const t of transactions) {
      totals[t.category] = totals[t.category] || { spent: 0, earned: 0, count: 0 };
      totals[t.category].count += 1;
      if (t.amount < 0) totals[t.category].spent += -t.amount;
      else totals[t.category].earned += t.amount;
    }
    const summaryRows = [['Category', 'Transactions', 'Money in', 'Money out', 'Net']];
    Object.entries(totals)
      .sort((a, b) => b[1].spent - a[1].spent)
      .forEach(([category, v]) => {
        summaryRows.push([category, v.count, Number(v.earned.toFixed(2)), Number(v.spent.toFixed(2)), Number((v.earned - v.spent).toFixed(2))]);
      });
    const totalIn = transactions.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const totalOut = transactions.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);
    summaryRows.push(['Total', transactions.length, Number(totalIn.toFixed(2)), Number(totalOut.toFixed(2)), Number((totalIn - totalOut).toFixed(2))]);

    const bytes = await rowsToXlsxBytes([
      { name: (bank ? `${bank} ` : '') + 'Transactions', rows: [header, ...rows] },
      { name: 'Category summary', rows: summaryRows }
    ]);
    saveBytes(bytes, `${name || 'statement'}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  const totalOut = transactions.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);

  return (
    <ToolLayout title="Bank Statement to Excel" description="Extract transactions from a text-based bank statement PDF, auto-categorise them and export a real .xlsx.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Bank statement PDF</label>
          <input className="tool-input" type="file" accept="application/pdf" onChange={handleFile} />
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Sheet / file name</label>
              <input className="tool-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="statement" />
            </div>
            <div className="control-group grow">
              <label className="tool-label">Bank (optional)</label>
              <input className="tool-input" type="text" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="HDFC" />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        {note && <p className="form-note">{note}</p>}

        <div className="tool-actions">
          <button className="tool-btn tool-btn-primary" onClick={convert} disabled={busy || !file}>
            {busy ? 'Reading statement…' : 'Extract transactions'}
          </button>
          {transactions.length > 0 && <button className="tool-btn" onClick={download}>Download .xlsx</button>}
        </div>

        {transactions.length > 0 && (
          <>
            <p className="form-note">Total money out: ₹{totalOut.toFixed(2)} across {transactions.length} rows.</p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Amount</th><th>Category</th></tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 30).map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td className={t.amount < 0 ? 'amount-out' : 'amount-in'}>{t.amount.toFixed(2)}</td>
                      <td>{t.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length > 30 && <p className="form-note">Showing the first 30 rows — the .xlsx contains all of them.</p>}
          </>
        )}

        <p className="form-note">
          Works with text-based statements from most Indian banks. Scanned or photographed statements need OCR first.
        </p>
      </div>
    </ToolLayout>
  );
};

export default BankStatementToExcel;
