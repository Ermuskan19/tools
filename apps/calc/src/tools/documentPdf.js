const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const clean = (value) => String(value ?? '').replace(/[^\x20-\x7E]/g, '?').replace(/\\/g, '/');
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const download = (bytes, filename) => {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

const makeDocument = async ({ title, documentNo, date, parties, item, totals, footer }) => {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 50;
  const green = rgb(0.024, 0.478, 0.333);
  const ink = rgb(0.06, 0.16, 0.12);
  const muted = rgb(0.35, 0.45, 0.4);
  const line = rgb(0.85, 0.91, 0.87);
  let y = height - margin;

  page.drawRectangle({ x: 0, y: height - 12, width, height: 12, color: green });
  page.drawText(clean(title), { x: margin, y: y - 18, size: 26, font: bold, color: ink });
  y -= 42;
  page.drawText('Made with 3toOne Calc', { x: margin, y, size: 10, font, color: muted });
  y -= 16;
  page.drawText(`${clean(documentNo)}  |  ${date}`, { x: margin, y, size: 10, font, color: muted });
  y -= 36;

  const half = (width - margin * 2) / 2;
  parties.forEach((party, index) => {
    const x = margin + index * half;
    page.drawText(clean(party.label).toUpperCase(), { x, y, size: 8.5, font: bold, color: muted });
    page.drawText(clean(party.value || '-'), { x, y: y - 17, size: 11, font: bold, color: ink });
    if (party.sub) page.drawText(clean(party.sub), { x, y: y - 33, size: 9.5, font, color: muted });
  });
  y -= 64;

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.8, color: line });
  y -= 18;
  page.drawText('DESCRIPTION', { x: margin, y, size: 8.5, font: bold, color: muted });
  page.drawText('QTY', { x: margin + 300, y, size: 8.5, font: bold, color: muted });
  page.drawText('RATE', { x: margin + 360, y, size: 8.5, font: bold, color: muted });
  page.drawText('AMOUNT', { x: margin + 450, y, size: 8.5, font: bold, color: muted });
  y -= 8;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.6, color: line });
  y -= 20;
  page.drawText(clean(item.description || 'Item').slice(0, 52), { x: margin, y, size: 10.5, font, color: ink });
  page.drawText(String(item.qty), { x: margin + 304, y, size: 10.5, font, color: ink });
  page.drawText(money(item.rate), { x: margin + 360, y, size: 9.5, font, color: ink });
  page.drawText(money(item.amount), { x: margin + 450, y, size: 9.5, font, color: ink });
  y -= 34;

  totals.forEach(([label, value, strong]) => {
    const f = strong ? bold : font;
    const size = strong ? 13 : 10.5;
    page.drawText(clean(label), { x: width - margin - 220, y, size, font: f, color: strong ? ink : muted });
    page.drawText(money(value), { x: width - margin - 100, y, size, font: f, color: ink });
    y -= strong ? 24 : 18;
  });

  y -= 24;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.6, color: line });
  y -= 20;
  const footerLines = String(footer || '').match(/.{1,88}(\s|$)/g) || [];
  footerLines.slice(0, 4).forEach((text) => {
    page.drawText(clean(text.trim()), { x: margin, y, size: 8.5, font, color: muted });
    y -= 13;
  });

  return doc.save();
};

export async function downloadInvoicePdf({ seller, buyer, invoiceNo, date, item, qty, unitPrice, gstRate }) {
  const subtotal = qty * unitPrice;
  const gst = subtotal * gstRate / 100;
  const bytes = await makeDocument({
    title: 'GST Invoice',
    documentNo: `Invoice ${invoiceNo || '-'}`,
    date: date || today(),
    parties: [
      { label: 'From', value: seller || 'Seller' },
      { label: 'Bill to', value: buyer || 'Customer' }
    ],
    item: { description: item || 'Goods / services', qty, rate: unitPrice, amount: subtotal },
    totals: [
      ['Subtotal', subtotal],
      [`GST @ ${gstRate}%`, gst],
      ['Total payable', subtotal + gst, true]
    ],
    footer: 'This is a computer-generated invoice. GST rates and totals should be checked against your tax records.'
  });
  download(bytes, `invoice-${(invoiceNo || '3toone').replace(/[^\w-]+/g, '-')}.pdf`);
}

export async function downloadQuotationPdf({ business, client, quoteNo, date, description, amount, discount, tax }) {
  const afterDiscount = amount * (1 - discount / 100);
  const taxAmount = afterDiscount * tax / 100;
  const bytes = await makeDocument({
    title: 'Quotation',
    documentNo: `Quote ${quoteNo || '-'}`,
    date: date || today(),
    parties: [
      { label: 'From', value: business || 'Business' },
      { label: 'Prepared for', value: client || 'Client' }
    ],
    item: { description: description || 'Work / goods', qty: 1, rate: amount, amount },
    totals: [
      ['Amount', amount],
      [`Discount @ ${discount}%`, -(amount - afterDiscount), false],
      [`Tax @ ${tax}%`, taxAmount],
      ['Quotation total', afterDiscount + taxAmount, true]
    ],
    footer: 'This quotation is an estimate. It is not a tax invoice or a demand for payment.'
  });
  download(bytes, `quotation-${(quoteNo || '3toone').replace(/[^\w-]+/g, '-')}.pdf`);
}
