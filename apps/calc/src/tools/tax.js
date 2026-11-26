// Income tax, FY 2025-26 (AY 2026-27), resident individuals below 60.
// Surcharge is not modelled; it only applies above ₹50 lakh.

export const CESS = 1.04;

export const NEW_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 }
];

export const OLD_SLABS = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: Infinity, rate: 30 }
];

export const LIMITS = {
  standardNew: 75000,
  standardOld: 50000,
  rebateNew: 1200000,
  rebateOld: 500000,
  c80: 150000,
  d80: 25000,
  homeInterest: 200000,
  nps: 50000
};

/** Slab-wise tax before rebate and cess. */
export const slabTax = (income, slabs) => {
  let previous = 0;
  let total = 0;
  const rows = [];
  for (const slab of slabs) {
    if (income <= previous) break;
    const amount = Math.min(income, slab.upTo) - previous;
    const tax = (amount * slab.rate) / 100;
    total += tax;
    rows.push({ from: previous, to: slab.upTo, rate: slab.rate, amount, tax });
    previous = slab.upTo;
  }
  return { total, rows };
};

export const rebateAndCess = (income, slabs, rebateLimit) => {
  const { total, rows } = slabTax(income, slabs);
  let tax = total;
  if (income > 0 && income <= rebateLimit) tax = 0;
  // Marginal relief just above the rebate limit: tax never exceeds the income
  // earned above that limit.
  if (income > rebateLimit) tax = Math.min(tax, income - rebateLimit);
  return { base: total, tax, cess: tax * 0.04, total: tax * CESS, rows, rebate: income <= rebateLimit };
};

export const computeTax = ({ gross, salaried = true, deductions = {} }) => {
  const c80 = Math.min(deductions.c80 || 0, LIMITS.c80);
  const d80 = Math.min(deductions.d80 || 0, LIMITS.d80);
  const home = Math.min(deductions.home || 0, LIMITS.homeInterest);
  const nps = Math.min(deductions.nps || 0, LIMITS.nps);
  const extra = c80 + d80 + home + nps;

  const oldIncome = Math.max(0, gross - (salaried ? LIMITS.standardOld : 0) - extra);
  const newIncome = Math.max(0, gross - (salaried ? LIMITS.standardNew : 0));

  const oldRegime = rebateAndCess(oldIncome, OLD_SLABS, LIMITS.rebateOld);
  const newRegime = rebateAndCess(newIncome, NEW_SLABS, LIMITS.rebateNew);

  return {
    gross,
    old: { taxable: oldIncome, ...oldRegime },
    new: { taxable: newIncome, ...newRegime },
    better: newRegime.total <= oldRegime.total ? 'new' : 'old',
    saving: Math.abs(newRegime.total - oldRegime.total),
    deductionsUsed: extra
  };
};
