import { computeTax } from './tax.js';

const PT = 2400;
const GRATUITY_PCT = 4.81;

/** CTC → gross → monthly in-hand, new regime, salaried. */
export const salaryBreakup = ({ ctc, basicPct = 40, hraPct = 50, metro = true }) => {
  const basic = ctc * (basicPct / 100);
  const hra = basic * ((metro ? hraPct : Math.min(hraPct, 40)) / 100);
  const employerPf = basic * 0.12;
  const gratuity = basic * (GRATUITY_PCT / 100);
  const gross = Math.max(0, ctc - employerPf - gratuity);
  const employeePf = basic * 0.12;
  const special = Math.max(0, gross - basic - hra);

  const tax = computeTax({ gross, salaried: true });
  const incomeTax = tax.new.total;
  const annualTake = gross - employeePf - PT - incomeTax;

  return {
    ctc,
    basic,
    hra,
    special,
    employerPf,
    gratuity,
    gross,
    employeePf,
    professionalTax: PT,
    incomeTax,
    annualTake,
    monthlyTake: annualTake / 12,
    monthlyGross: gross / 12,
    deductions: employeePf + PT + incomeTax
  };
};
