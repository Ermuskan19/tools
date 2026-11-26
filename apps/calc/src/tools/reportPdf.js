import { debtFreeLabel } from './emi';

const money = (x) => `Rs ${Math.round(x).toLocaleString('en-IN')}`;

/* Plain, printable one-file report. Loaded on demand so pdf-lib never ships
   in the initial bundle. */
export async function downloadEmiPdf({ result, loanType }) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const green = rgb(0.024, 0.478, 0.333);
  const ink = rgb(0.06, 0.16, 0.12);
  const muted = rgb(0.35, 0.45, 0.4);
  const lineColor = rgb(0.85, 0.91, 0.87);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const newPage = () => {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    page.drawText('EMI plan (continued)', { x: margin, y, size: 12, font: bold, color: green });
    y -= 22;
  };

  const ensure = (space) => {
    if (y - space < margin + 30) newPage();
  };

  page.drawText('EMI plan', { x: margin, y: y - 16, size: 26, font: bold, color: ink });
  y -= 34;
  page.drawText('Made with 3toOne Calc', { x: margin, y, size: 10, font, color: muted });
  y -= 14;
  page.drawText(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), {
    x: margin, y, size: 10, font, color: muted
  });
  y -= 30;

  const rows = [
    ['Loan type', `${loanType} loan`],
    ['Loan amount', money(result.amount)],
    ['Interest rate', `${result.rate}% per year`],
    ['Loan period', `${result.months} months`],
    ['Monthly EMI', money(result.emi)],
    ['Total interest', money(result.totalInterest)],
    ['Total payable', money(result.totalPayable)],
    ['Debt-free by', debtFreeLabel(result.months)]
  ];

  page.drawText('Summary', { x: margin, y, size: 13, font: bold, color: ink });
  y -= 18;
  rows.forEach(([label, value]) => {
    page.drawText(label, { x: margin, y, size: 10.5, font, color: muted });
    page.drawText(value, { x: margin + 170, y, size: 10.5, font: bold, color: ink });
    y -= 17;
  });

  y -= 16;
  ensure(60);
  page.drawText('Year-by-year schedule', { x: margin, y, size: 13, font: bold, color: ink });
  y -= 22;

  const columns = [margin, margin + 90, margin + 220, margin + 350];
  const header = ['YEAR', 'PRINCIPAL', 'INTEREST', 'BALANCE'];
  page.drawText(header[0], { x: columns[0], y, size: 9, font: bold, color: muted });
  page.drawText(header[1], { x: columns[1], y, size: 9, font: bold, color: muted });
  page.drawText(header[2], { x: columns[2], y, size: 9, font: bold, color: muted });
  page.drawText(header[3], { x: columns[3], y, size: 9, font: bold, color: muted });
  y -= 6;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.8, color: lineColor });
  y -= 14;

  result.schedule.years.forEach((year, index) => {
    ensure(18);
    page.drawText(String(index + 1), { x: columns[0], y, size: 9.5, font, color: ink });
    page.drawText(money(year.principal), { x: columns[1], y, size: 9.5, font, color: ink });
    page.drawText(money(year.interest), { x: columns[2], y, size: 9.5, font, color: ink });
    page.drawText(money(year.balance), { x: columns[3], y, size: 9.5, font, color: ink });
    y -= 16;
  });

  y -= 10;
  ensure(30);
  page.drawText(
    'Results are estimates for planning. They are not financial, tax or legal advice.',
    { x: margin, y, size: 8.5, font, color: muted }
  );

  const bytes = await doc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '3toOne-EMI-plan.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
