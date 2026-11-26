// Fixed deposit maths. Banks compound cumulative FDs every quarter by default.

const QUARTERS = 4;

export const fdMaturity = (principal, rate, months) => {
  const years = months / 12;
  if (!(principal > 0) || !(years > 0)) return 0;
  return principal * Math.pow(1 + rate / 100 / QUARTERS, QUARTERS * years);
};

export const fdBreakdown = ({ principal, rate, months, slab = 30, tds = true }) => {
  const maturity = fdMaturity(principal, rate, months);
  const interest = maturity - principal;
  const tax = interest * (slab / 100);
  const tdsCut = tds && interest > 40000 ? interest * 0.1 : 0;
  return {
    principal,
    maturity,
    interest,
    tax,
    tds: tdsCut,
    afterTax: maturity - tax,
    netInterest: interest - tax,
    yieldPct: principal > 0 && months > 0
      ? (Math.pow(maturity / principal, 12 / months) - 1) * 100
      : 0
  };
};

/** Non-cumulative FD: interest is paid out and the principal stays put. */
export const fdPayout = ({ principal, rate, months }) => {
  const years = months / 12;
  return {
    principal,
    interest: principal * (rate / 100) * years,
    monthly: principal * (rate / 100) / 12
  };
};

/** Yearly balance for the growth chart. */
export const fdYearly = ({ principal, rate, months }) => {
  const years = Math.ceil(months / 12);
  const rows = [];
  for (let y = 1; y <= years; y += 1) {
    const value = fdMaturity(principal, rate, Math.min(y * 12, months));
    rows.push({ year: y, value, interest: value - principal });
  }
  return rows;
};

/** Same deposit at nearby rates, so the user can see what 0.5% is worth. */
export const fdRateLadder = ({ principal, rate, months }) =>
  [-1, -0.5, 0, 0.5, 1]
    .map((delta) => {
      const r = Math.max(0, rate + delta);
      return { rate: r, delta, maturity: fdMaturity(principal, r, months) };
    })
    .filter((row) => row.rate > 0);
