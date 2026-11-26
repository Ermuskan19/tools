// SIP maths. Contributions are assumed at the start of each month, which is
// how most SIPs are actually debited.

export const sipProject = ({ monthly, years, rate, stepUp = 0, lumpsum = 0 }) => {
  const months = Math.max(0, Math.round(years * 12));
  const r = rate / 1200;
  let value = Math.max(0, lumpsum);
  let invested = Math.max(0, lumpsum);
  const yearly = [];

  for (let m = 1; m <= months; m += 1) {
    const yearIndex = Math.floor((m - 1) / 12);
    const contribution = Math.max(0, monthly) * Math.pow(1 + stepUp / 100, yearIndex);
    value = (value + contribution) * (1 + r);
    invested += contribution;

    if (m % 12 === 0 || m === months) {
      yearly.push({
        year: Math.ceil(m / 12),
        invested,
        value,
        gains: value - invested
      });
    }
  }

  return {
    months,
    invested,
    value,
    gains: value - invested,
    yearly
  };
};

/** Monthly SIP needed to reach `target`, with an optional starting lumpsum. */
export const requiredMonthly = ({ target, years, rate, lumpsum = 0 }) => {
  const months = Math.max(0, Math.round(years * 12));
  if (!(months > 0) || !(target > 0)) return 0;
  const r = rate / 1200;
  const lumpsumFuture = lumpsum * Math.pow(1 + r, months);
  const remaining = target - lumpsumFuture;
  if (remaining <= 0) return 0;
  if (r === 0) return remaining / months;
  const growth = Math.pow(1 + r, months);
  return (remaining * r) / ((growth - 1) * (1 + r));
};

/** What a corpus is worth in today's money after inflation. */
export const realValue = (value, inflation, years) =>
  inflation > 0 ? value / Math.pow(1 + inflation / 100, years) : value;

/** Year-by-year value of a one-time investment, for comparison. */
export const lumpsumProject = ({ lumpsum, years, rate }) => {
  const yearly = [];
  for (let y = 1; y <= Math.round(years); y += 1) {
    const value = lumpsum * Math.pow(1 + rate / 100, y);
    yearly.push({ year: y, invested: lumpsum, value, gains: value - lumpsum });
  }
  return { invested: lumpsum, value: lumpsum * Math.pow(1 + rate / 100, years), yearly };
};
