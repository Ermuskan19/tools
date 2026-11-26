// Pure EMI maths. Every panel on the page reads from these helpers so the
// numbers can never disagree with each other.

export const inr = (x) =>
  Number.isFinite(x) ? `₹${Math.round(x).toLocaleString('en-IN')}` : '—';

export const compact = (x) => {
  if (!Number.isFinite(x)) return '—';
  if (x >= 1e7) return `₹${+(x / 1e7).toFixed(2)} Cr`;
  if (x >= 1e5) return `₹${+(x / 1e5).toFixed(2)} L`;
  if (x >= 1e3) return `₹${+(x / 1e3).toFixed(1)}K`;
  return `₹${Math.round(x)}`;
};

export const duration = (months) => {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? 'yr' : 'yrs'}`);
  if (m) parts.push(`${m} ${m === 1 ? 'mo' : 'mo'}`);
  return parts.join(' ') || '0 mo';
};

/** Monthly EMI for a loan of P at annualRate % over n months. */
export const emiFor = (P, annualRate, n) => {
  const i = annualRate / 1200;
  if (!(P > 0) || !(n > 0)) return 0;
  if (i === 0) return P / n;
  const growth = Math.pow(1 + i, n);
  return (P * i * growth) / (growth - 1);
};

/** How much can be borrowed for a given EMI at annualRate % over n months. */
export const amountFor = (emi, annualRate, n) => {
  const i = annualRate / 1200;
  if (!(emi > 0) || !(n > 0)) return 0;
  if (i === 0) return emi * n;
  const growth = Math.pow(1 + i, n);
  return (emi * (growth - 1)) / (i * growth);
};

/** Months needed to repay P at annualRate % with a fixed EMI. null = never. */
export const monthsFor = (P, annualRate, emi) => {
  const i = annualRate / 1200;
  if (!(P > 0) || !(emi > 0)) return null;
  if (i === 0) return Math.ceil(P / emi);
  if (emi <= P * i) return null;
  return Math.ceil(-Math.log(1 - (P * i) / emi) / Math.log(1 + i));
};

/**
 * Month-by-month amortization.
 * Returns { months, totalInterest, years: [{ principal, interest, balance }], rows }
 * or null when the payment never covers the interest.
 */
export const schedule = (P, annualRate, emi, extra = 0, lumpSum = 0) => {
  const i = annualRate / 1200;
  let balance = Math.max(0, P - (lumpSum || 0));
  let months = 0;
  let totalInterest = 0;
  const years = [];
  const rows = [];

  while (balance > 0.5 && months < 1200) {
    months += 1;
    const interest = balance * i;
    const payment = emi + (extra || 0);
    if (payment <= interest) return null;
    const principal = Math.min(payment - interest, balance);
    balance -= principal;
    totalInterest += interest;

    const yearIndex = Math.ceil(months / 12) - 1;
    if (!years[yearIndex]) years[yearIndex] = { principal: 0, interest: 0, balance: 0 };
    years[yearIndex].principal += principal;
    years[yearIndex].interest += interest;
    years[yearIndex].balance = balance;

    rows.push({ principal, interest, balance });
  }

  return { months, totalInterest, years, rows };
};

/** Month name for "debt-free by": first EMI is next calendar month. */
export const debtFreeLabel = (months, from = new Date()) => {
  if (!Number.isFinite(months) || months <= 0) return '—';
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

/**
 * The single source of truth for the whole page.
 * mode: 'emi' | 'borrow' | 'time'
 */
export const computeLoan = ({ mode, amount, rate, months, emi }) => {
  if (!(rate >= 0) || rate > 40) {
    return { error: 'Enter an interest rate between 0% and 40%.' };
  }

  let P = amount;
  let n = months;
  let E = emi;

  if (mode === 'emi') {
    if (!(P > 0 && n > 0)) return { error: 'Enter a loan amount and a loan period.' };
    E = emiFor(P, rate, n);
  } else if (mode === 'borrow') {
    if (!(E > 0 && n > 0)) return { error: 'Enter the EMI you can pay and a loan period.' };
    P = amountFor(E, rate, n);
  } else {
    if (!(P > 0 && E > 0)) return { error: 'Enter a loan amount and the EMI you want to pay.' };
    n = monthsFor(P, rate, E);
    if (!n) {
      return {
        error: `At ${inr(E)} a month the EMI only covers the interest, so the loan never ends. Raise the EMI or lower the loan amount.`
      };
    }
    if (n > 1200) return { error: 'This would take over 100 years. Raise the EMI.' };
    if (E > P * (1 + rate / 1200)) E = P * (1 + rate / 1200);
  }

  const s = schedule(P, rate, E, 0, 0);
  if (!s) return { error: 'This EMI does not cover the interest on the loan.' };

  return {
    amount: P,
    rate,
    months: n,
    emi: E,
    schedule: s,
    totalInterest: s.totalInterest,
    totalPayable: P + s.totalInterest
  };
};

/** Effective annual rate for a loan where `net` is actually received. */
export const effectiveRate = (net, emi, months) => {
  if (!(net > 0) || !(emi > 0) || !(months > 0)) return null;
  const pv = (m) =>
    m < 1e-9 ? emi * months : (emi * (1 - Math.pow(1 + m, -months))) / m;
  let lo = 0;
  let hi = 0.2;
  if (pv(hi) > net) return hi * 1200;
  for (let k = 0; k < 80; k += 1) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > net) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 1200;
};

export const verdictFor = (emi, otherEmi, income) => {
  if (!(income > 0)) return null;
  const ratio = ((emi + otherEmi) / income) * 100;
  if (ratio <= 35) return { ratio, tone: 'good', label: 'Comfortable' };
  if (ratio <= 50) return { ratio, tone: 'warn', label: 'Careful' };
  return { ratio, tone: 'bad', label: 'Risky' };
};

/** First-year interest and principal split, used by the tax panel. */
export const firstYearSplit = (schedule) => {
  const rows = schedule?.rows?.slice(0, 12) || [];
  return rows.reduce(
    (acc, r) => ({ interest: acc.interest + r.interest, principal: acc.principal + r.principal }),
    { interest: 0, principal: 0 }
  );
};
