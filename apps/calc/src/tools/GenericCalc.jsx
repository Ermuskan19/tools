import { useState, useMemo } from 'react';
import { MoneyField, RangeField, Stat, Toggle, Segmented, EmptyPanel } from '../components/CalcUI';
import { inr, compact, pct } from './format';
import { downloadInvoicePdf, downloadQuotationPdf } from './documentPdf';

const inr2 = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/* ---------------- Loan Calculator ---------------- */
const LoanCalculator = () => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(10);
  const [months, setMonths] = useState(36);
  const emi = useMemo(() => {
    const r = rate / 12 / 100;
    if (r === 0) return amount / months;
    return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }, [amount, rate, months]);
  const total = emi * months;
  const interest = total - amount;
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your loan</h2><span className="live-pill">Live</span></div>
          <MoneyField id="la" label="Loan amount" value={amount} onChange={setAmount} />
          <RangeField label="Interest rate (per year)" value={rate} min={1} max={30} step={0.25} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="30%" />
          <RangeField label="Tenure (months)" value={months} min={1} max={360} step={1} onChange={setMonths} display={`${months} months`} footLeft="1 mo" footRight="30 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Your result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Monthly EMI</div>
          <div className="result-big">{inr(emi)}</div>
          <div className="stat-grid dark">
            <Stat label="Total payable" value={inr(total)} />
            <Stat label="Total interest" value={inr(interest)} tone="bad" />
            <Stat label="Principal" value={inr(amount)} />
            <Stat label="Tenure" value={`${months} months`} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Rent vs Buy ---------------- */
const RentVsBuyCalculator = () => {
  const [rent, setRent] = useState(25000);
  const [price, setPrice] = useState(5000000);
  const [appreciation, setAppreciation] = useState(5);
  const [rentGrowth, setRentGrowth] = useState(5);
  const [investReturn, setInvestReturn] = useState(8);
  const [years, setYears] = useState(10);
  const result = useMemo(() => {
    // Future value of buying: property value after years
    const futurePrice = price * Math.pow(1 + appreciation / 100, years);
    // Total rent paid over years (growing)
    let totalRent = 0;
    let r = rent;
    for (let i = 0; i < years; i++) { totalRent += r * 12; r *= 1 + rentGrowth / 100; }
    // If renting, invest the down payment (20%) difference
    const downPayment = price * 0.2;
    const investedValue = downPayment * Math.pow(1 + investReturn / 100, years);
    const buyNet = futurePrice - price; // gain
    const rentNet = investedValue - downPayment - totalRent; // simplified
    const breakEven = buyNet + totalRent - investedValue + downPayment;
    return { futurePrice, totalRent, investedValue, buyNet, rentNet };
  }, [rent, price, appreciation, rentGrowth, investReturn, years]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <MoneyField id="rvb-rent" label="Monthly rent" value={rent} onChange={setRent} />
          <MoneyField id="rvb-price" label="Property price" value={price} onChange={setPrice} />
          <RangeField label="Property appreciation (%/yr)" value={appreciation} min={0} max={15} step={0.5} onChange={setAppreciation} display={pct(appreciation)} footLeft="0%" footRight="15%" />
          <RangeField label="Rent growth (%/yr)" value={rentGrowth} min={0} max={15} step={0.5} onChange={setRentGrowth} display={pct(rentGrowth)} footLeft="0%" footRight="15%" />
          <RangeField label="Investment return (%/yr)" value={investReturn} min={1} max={20} step={0.5} onChange={setInvestReturn} display={pct(investReturn)} footLeft="1%" footRight="20%" />
          <RangeField label="Horizon (years)" value={years} min={1} max={30} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="30 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="stat-grid dark">
            <Stat label="Property value after period" value={inr(result.futurePrice)} tone="good" />
            <Stat label="Total rent paid" value={inr(result.totalRent)} tone="bad" />
            <Stat label="Invested down payment value" value={inr(result.investedValue)} />
            <Stat label="Buy gain" value={inr(result.buyNet)} />
          </div>
          <p className="panel-note">If property gain beats rent + invested value, buying wins. Adjust horizon to find break-even.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- HRA Exemption ---------------- */
const HraCalculator = () => {
  const [basic, setBasic] = useState(50000);
  const [hra, setHra] = useState(20000);
  const [rent, setRent] = useState(18000);
  const [metro, setMetro] = useState(true);
  const [other, setOther] = useState(0);
  const result = useMemo(() => {
    const a = hra;
    const b = metro ? 0.5 * basic : 0.4 * basic;
    const c = Math.max(0, rent * 12 - 0.1 * basic * 12) / 12;
    const exempt = Math.min(a, b, c);
    return { exempt, taxable: Math.max(0, hra - exempt) };
  }, [basic, hra, rent, metro]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your salary</h2><span className="live-pill">Live</span></div>
          <MoneyField id="hra-basic" label="Basic salary (monthly)" value={basic} onChange={setBasic} />
          <MoneyField id="hra-hra" label="HRA received (monthly)" value={hra} onChange={setHra} />
          <MoneyField id="hra-rent" label="Rent paid (monthly)" value={rent} onChange={setRent} />
          <Toggle id="hra-metro" label="Metro city (Delhi/Mumbai/Kolkata/Chennai)" checked={metro} onChange={setMetro} />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">HRA exempt</div>
          <div className="result-big">{inr(result.exempt)}</div>
          <div className="stat-grid dark">
            <Stat label="Taxable HRA" value={inr(result.taxable)} tone={result.taxable > 0 ? 'bad' : 'good'} />
            <Stat label="HRA received" value={inr(hra)} />
            <Stat label="Rent paid" value={inr(rent)} />
          </div>
          <p className="panel-note">Exemption = min(HRA, {metro ? '50%' : '40%'} of basic, rent − 10% of basic).</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Gratuity ---------------- */
const GratuityCalculator = () => {
  const [salary, setSalary] = useState(50000);
  const [years, setYears] = useState(5);
  const gratuity = useMemo(() => {
    // (15/26) * last drawn salary * years, capped at 20 lakh
    const g = (15 / 26) * salary * years;
    return Math.min(g, 2000000);
  }, [salary, years]);
  const eligible = years >= 5;
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your details</h2><span className="live-pill">Live</span></div>
          <MoneyField id="grat-sal" label="Last drawn basic + DA (monthly)" value={salary} onChange={setSalary} />
          <RangeField label="Years of service" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Gratuity</div>
          <div className="result-big">{inr(gratuity)}</div>
          <div className="stat-grid dark">
            <Stat label="Eligible (5+ yrs)" value={eligible ? 'Yes' : 'No'} tone={eligible ? 'good' : 'bad'} />
            <Stat label="Cap (₹20 lakh)" value={gratuity >= 2000000 ? 'Reached' : 'Not reached'} />
          </div>
          <p className="panel-note">Gratuity = (15/26) × last drawn salary × years of service.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- PF ---------------- */
const PfCalculator = () => {
  const [basic, setBasic] = useState(30000);
  const [employeePct, setEmployeePct] = useState(12);
  const [employerPct, setEmployerPct] = useState(12);
  const [years, setYears] = useState(5);
  const result = useMemo(() => {
    const empMonthly = basic * employeePct / 100;
    const erMonthly = basic * employerPct / 100;
    const totalMonthly = empMonthly + erMonthly;
    const rate = 0.0825 / 12;
    const n = years * 12;
    const corpus = totalMonthly * ((Math.pow(1 + rate, n) - 1) / rate);
    return { empMonthly, erMonthly, totalMonthly, corpus };
  }, [basic, employeePct, employerPct, years]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your PF</h2><span className="live-pill">Live</span></div>
          <MoneyField id="pf-basic" label="Basic salary (monthly)" value={basic} onChange={setBasic} />
          <RangeField label="Employee contribution %" value={employeePct} min={0} max={20} step={1} onChange={setEmployeePct} display={pct(employeePct)} footLeft="0%" footRight="20%" />
          <RangeField label="Employer contribution %" value={employerPct} min={0} max={20} step={1} onChange={setEmployerPct} display={pct(employerPct)} footLeft="0%" footRight="20%" />
          <RangeField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Projected corpus</div>
          <div className="result-big">{inr(result.corpus)}</div>
          <div className="stat-grid dark">
            <Stat label="Employee / month" value={inr(result.empMonthly)} />
            <Stat label="Employer / month" value={inr(result.erMonthly)} />
            <Stat label="Total / month" value={inr(result.totalMonthly)} tone="good" />
            <Stat label="Years" value={years} />
          </div>
          <p className="panel-note">Assumes 8.25% annual interest compounded monthly.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- GST ---------------- */
const GstCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState('add'); // add or remove
  const [intra, setIntra] = useState(true);
  const result = useMemo(() => {
    let base, gst;
    if (mode === 'add') { base = amount; gst = amount * rate / 100; }
    else { base = amount / (1 + rate / 100); gst = amount - base; }
    const total = base + gst;
    const half = gst / 2;
    return { base, gst, total, cgst: intra ? half : 0, sgst: intra ? half : 0, igst: intra ? 0 : gst };
  }, [amount, rate, mode, intra]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>GST</h2><span className="live-pill">Live</span></div>
          <MoneyField id="gst-amt" label="Amount" value={amount} onChange={setAmount} />
          <Segmented options={[{ value: 5, label: '5%' }, { value: 12, label: '12%' }, { value: 18, label: '18%' }, { value: 28, label: '28%' }]} value={rate} onChange={setRate} label="GST rate" />
          <Segmented options={[{ value: 'add', label: 'Add GST' }, { value: 'remove', label: 'Remove GST' }]} value={mode} onChange={setMode} label="Mode" />
          <Toggle id="gst-intra" label="Intra-state (CGST + SGST)" checked={intra} onChange={setIntra} />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Total</div>
          <div className="result-big">{inr(result.total)}</div>
          <div className="stat-grid dark">
            <Stat label="Base amount" value={inr(result.base)} />
            <Stat label="GST" value={inr(result.gst)} tone="bad" />
            {intra ? (
              <>
                <Stat label="CGST" value={inr(result.cgst)} />
                <Stat label="SGST" value={inr(result.sgst)} />
              </>
            ) : (
              <Stat label="IGST" value={inr(result.igst)} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Step-up SIP ---------------- */
const StepUpSipCalculator = () => {
  const [sip, setSip] = useState(5000);
  const [stepUp, setStepUp] = useState(10);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const result = useMemo(() => {
    const r = rate / 12 / 100;
    let corpus = 0;
    let monthly = sip;
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + monthly) * (1 + r);
      }
      monthly *= 1 + stepUp / 100;
    }
    const invested = sip * ((Math.pow(1 + stepUp / 100, years) - 1) / (stepUp / 100)) * 12; // approx
    return { corpus, invested: sip * 12 * years }; // simplified invested
  }, [sip, stepUp, rate, years]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your SIP</h2><span className="live-pill">Live</span></div>
          <MoneyField id="ss-sip" label="Monthly SIP" value={sip} onChange={setSip} />
          <RangeField label="Yearly step-up %" value={stepUp} min={0} max={25} step={1} onChange={setStepUp} display={pct(stepUp)} footLeft="0%" footRight="25%" />
          <RangeField label="Expected return %" value={rate} min={1} max={30} step={0.5} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="30%" />
          <RangeField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Corpus</div>
          <div className="result-big">{inr(result.corpus)}</div>
          <div className="stat-grid dark">
            <Stat label="Monthly SIP (start)" value={inr(sip)} />
            <Stat label="Step-up" value={pct(stepUp)} />
            <Stat label="Years" value={years} />
          </div>
          <p className="panel-note">Corpus assumes the SIP increases by the step-up % each year.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Lumpsum ---------------- */
const LumpsumCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const maturity = principal * Math.pow(1 + rate / 100, years);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your investment</h2><span className="live-pill">Live</span></div>
          <MoneyField id="ls-principal" label="Lumpsum amount" value={principal} onChange={setPrincipal} />
          <RangeField label="Expected return %" value={rate} min={1} max={30} step={0.5} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="30%" />
          <RangeField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Maturity value</div>
          <div className="result-big">{inr(maturity)}</div>
          <div className="stat-grid dark">
            <Stat label="Invested" value={inr(principal)} />
            <Stat label="Gain" value={inr(maturity - principal)} tone="good" />
            <Stat label="Years" value={years} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- RD ---------------- */
const RdCalculator = () => {
  const [deposit, setDeposit] = useState(5000);
  const [rate, setRate] = useState(7);
  const [months, setMonths] = useState(12);
  const result = useMemo(() => {
    const r = rate / 12 / 100;
    const n = months;
    const maturity = deposit * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    return { maturity, interest: maturity - deposit * n };
  }, [deposit, rate, months]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Your RD</h2><span className="live-pill">Live</span></div>
          <MoneyField id="rd-dep" label="Monthly deposit" value={deposit} onChange={setDeposit} />
          <RangeField label="Interest rate %" value={rate} min={1} max={12} step={0.25} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="12%" />
          <RangeField label="Tenure (months)" value={months} min={3} max={120} step={3} onChange={setMonths} display={`${months} mo`} footLeft="3 mo" footRight="10 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Maturity value</div>
          <div className="result-big">{inr(result.maturity)}</div>
          <div className="stat-grid dark">
            <Stat label="Total deposited" value={inr(deposit * months)} />
            <Stat label="Interest earned" value={inr(result.interest)} tone="good" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Compound Interest ---------------- */
const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);
  const [n, setN] = useState(4); // times per year
  const maturity = principal * Math.pow(1 + rate / 100 / n, n * years);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <MoneyField id="ci-p" label="Principal" value={principal} onChange={setPrincipal} />
          <RangeField label="Rate %" value={rate} min={1} max={20} step={0.25} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="20%" />
          <RangeField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
          <Segmented options={[{ value: 1, label: 'Yearly' }, { value: 2, label: 'Half-yrly' }, { value: 4, label: 'Quarterly' }, { value: 12, label: 'Monthly' }]} value={n} onChange={setN} label="Compounding" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Maturity value</div>
          <div className="result-big">{inr(maturity)}</div>
          <div className="stat-grid dark">
            <Stat label="Principal" value={inr(principal)} />
            <Stat label="Interest" value={inr(maturity - principal)} tone="good" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Simple Interest ---------------- */
const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);
  const interest = principal * rate * years / 100;
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <MoneyField id="si-p" label="Principal" value={principal} onChange={setPrincipal} />
          <RangeField label="Rate %" value={rate} min={1} max={20} step={0.25} onChange={setRate} display={pct(rate)} footLeft="1%" footRight="20%" />
          <RangeField label="Years" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} yrs`} footLeft="1 yr" footRight="40 yrs" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Simple interest</div>
          <div className="result-big">{inr(interest)}</div>
          <div className="stat-grid dark">
            <Stat label="Total amount" value={inr(principal + interest)} tone="good" />
            <Stat label="Principal" value={inr(principal)} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Age Calculator ---------------- */
const AgeCalculator = () => {
  const [dob, setDob] = useState('2000-01-01');
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const result = useMemo(() => {
    const b = new Date(dob);
    const a = new Date(asOf);
    if (isNaN(b) || isNaN(a) || a < b) return null;
    let y = a.getFullYear() - b.getFullYear();
    let m = a.getMonth() - b.getMonth();
    let d = a.getDate() - b.getDate();
    if (d < 0) { m -= 1; d += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
    if (m < 0) { y -= 1; m += 12; }
    const days = Math.floor((a - b) / (1000 * 60 * 60 * 24));
    return { y, m, d, days };
  }, [dob, asOf]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <div className="cal-field"><label className="field-label">Date of birth</label><div className="number-box wide"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">As of date</label><div className="number-box wide"><input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></div></div>
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          {result ? (
            <>
              <div className="result-label">Your age</div>
              <div className="result-big">{result.y} yrs {result.m} mo {result.d} days</div>
              <div className="stat-grid dark">
                <Stat label="Years" value={result.y} />
                <Stat label="Months" value={result.m} />
                <Stat label="Days" value={result.d} />
                <Stat label="Total days" value={result.days.toLocaleString('en-IN')} />
              </div>
            </>
          ) : <EmptyPanel>Enter valid dates.</EmptyPanel>}
        </div>
      </div>
    </section>
  );
};

/* ---------------- CGPA to Percentage ---------------- */
const CgpaToPercentage = () => {
  const [cgpa, setCgpa] = useState(8);
  const [formula, setFormula] = useState('10');
  const pctVal = useMemo(() => {
    const c = cgpa;
    if (formula === '10') return c * 9.5;
    if (formula === '9.5') return c * 9.5;
    if (formula === 'cbse') return c * 9.5;
    return c * 10;
  }, [cgpa, formula]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <RangeField label="CGPA" value={cgpa} min={0} max={10} step={0.01} onChange={setCgpa} display={cgpa.toFixed(2)} footLeft="0" footRight="10" />
          <Segmented options={[{ value: '10', label: '× 9.5 (CBSE)' }, { value: '9.5', label: '× 9.5' }, { value: '10x', label: '× 10' }]} value={formula} onChange={setFormula} label="Formula" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Percentage</div>
          <div className="result-big">{pct(pctVal, 2)}</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Percentage Calculator ---------------- */
const PercentageCalculator = () => {
  const [a, setA] = useState(50);
  const [b, setB] = useState(200);
  const [mode, setMode] = useState('of');
  const result = useMemo(() => {
    if (mode === 'of') return (a / 100) * b;
    if (mode === 'is') return (a / b) * 100;
    return ((b - a) / a) * 100;
  }, [a, b, mode]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <Segmented options={[{ value: 'of', label: 'X% of Y' }, { value: 'is', label: 'X is what % of Y' }, { value: 'change', label: '% change' }]} value={mode} onChange={setMode} label="Mode" />
          <MoneyField id="p-a" label={mode === 'change' ? 'Old value' : 'Value A'} value={a} onChange={setA} prefix="" />
          <MoneyField id="p-b" label={mode === 'change' ? 'New value' : 'Value B'} value={b} onChange={setB} prefix="" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Result</div>
          <div className="result-big">{mode === 'of' ? inr(result) : pct(result, 2)}</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- BMI ---------------- */
const BmiCalculator = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const bmi = weight / Math.pow(height / 100, 2);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 23 ? 'Normal (Asian)' : bmi < 27.5 ? 'Overweight' : 'Obese';
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <RangeField label="Weight (kg)" value={weight} min={20} max={200} step={1} onChange={setWeight} display={`${weight} kg`} footLeft="20" footRight="200" />
          <RangeField label="Height (cm)" value={height} min={100} max={220} step={1} onChange={setHeight} display={`${height} cm`} footLeft="100" footRight="220" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">BMI</div>
          <div className="result-big">{bmi.toFixed(1)}</div>
          <div className="stat-grid dark">
            <Stat label="Category" value={cat} tone={cat === 'Normal (Asian)' ? 'good' : 'bad'} />
          </div>
          <p className="panel-note">Asian BMI cutoffs: normal 18.5–22.9.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Time Calculator ---------------- */
const TimeCalculator = () => {
  const [h1, setH1] = useState(2);
  const [m1, setM1] = useState(30);
  const [h2, setH2] = useState(1);
  const [m2, setM2] = useState(15);
  const [op, setOp] = useState('add');
  const totalMin = op === 'add' ? (h1 * 60 + m1) + (h2 * 60 + m2) : (h1 * 60 + m1) - (h2 * 60 + m2);
  const h = Math.floor(Math.abs(totalMin) / 60);
  const m = Math.abs(totalMin) % 60;
  const sign = totalMin < 0 ? '-' : '';
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Time</h2><span className="live-pill">Live</span></div>
          <Segmented options={[{ value: 'add', label: 'Add' }, { value: 'sub', label: 'Subtract' }]} value={op} onChange={setOp} label="Operation" />
          <div className="cal-field"><label className="field-label">Hours 1</label><div className="number-box wide"><input type="number" value={h1} onChange={(e) => setH1(Number(e.target.value))} /></div></div>
          <div className="cal-field"><label className="field-label">Minutes 1</label><div className="number-box wide"><input type="number" value={m1} onChange={(e) => setM1(Number(e.target.value))} /></div></div>
          <div className="cal-field"><label className="field-label">Hours 2</label><div className="number-box wide"><input type="number" value={h2} onChange={(e) => setH2(Number(e.target.value))} /></div></div>
          <div className="cal-field"><label className="field-label">Minutes 2</label><div className="number-box wide"><input type="number" value={m2} onChange={(e) => setM2(Number(e.target.value))} /></div></div>
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Result</div>
          <div className="result-big">{sign}{h} h {m} m</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Date Difference ---------------- */
const DateDifferenceCalculator = () => {
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const result = useMemo(() => {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e)) return null;
    const diff = Math.abs(e - s);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    return { days, months, years };
  }, [start, end]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Dates</h2><span className="live-pill">Live</span></div>
          <div className="cal-field"><label className="field-label">Start date</label><div className="number-box wide"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">End date</label><div className="number-box wide"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div></div>
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          {result ? (
            <>
              <div className="result-label">Difference</div>
              <div className="result-big">{result.days} days</div>
              <div className="stat-grid dark">
                <Stat label="Years" value={result.years} />
                <Stat label="Months" value={result.months} />
                <Stat label="Days" value={result.days} />
              </div>
            </>
          ) : <EmptyPanel>Enter valid dates.</EmptyPanel>}
        </div>
      </div>
    </section>
  );
};

/* ---------------- Working Days (approx, excludes weekends) ---------------- */
const WorkingDaysCalculator = () => {
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const result = useMemo(() => {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s) || isNaN(e) || e < s) return null;
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [start, end]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Dates</h2><span className="live-pill">Live</span></div>
          <div className="cal-field"><label className="field-label">Start date</label><div className="number-box wide"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">End date</label><div className="number-box wide"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div></div>
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Working days (excl. weekends)</div>
          <div className="result-big">{result ?? '—'}</div>
          <p className="panel-note">Excludes weekends. Public holidays not deducted.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Unit Converter ---------------- */
const UNITS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.34 },
  weight: { kg: 1, g: 0.001, mg: 1e-6, lb: 0.453592, oz: 0.0283495 },
  volume: { l: 1, ml: 0.001, gal: 3.78541, cup: 0.236588 },
};
const UnitConverter = () => {
  const [cat, setCat] = useState('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [value, setValue] = useState(1);
  const result = value * UNITS[cat][from] / UNITS[cat][to];
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Convert</h2><span className="live-pill">Live</span></div>
          <Segmented options={[{ value: 'length', label: 'Length' }, { value: 'weight', label: 'Weight' }, { value: 'volume', label: 'Volume' }]} value={cat} onChange={(v) => { setCat(v); const keys = Object.keys(UNITS[v]); setFrom(keys[0]); setTo(keys[1]); }} label="Category" />
          <RangeField label="Value" value={value} min={0} max={10000} step={0.1} onChange={setValue} display={value} footLeft="0" footRight="10000" />
          <Segmented options={Object.keys(UNITS[cat]).map((u) => ({ value: u, label: u }))} value={from} onChange={setFrom} label="From" />
          <Segmented options={Object.keys(UNITS[cat]).map((u) => ({ value: u, label: u }))} value={to} onChange={setTo} label="To" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Converted</div>
          <div className="result-big">{result.toFixed(4)} {to}</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Currency Converter (static rates) ---------------- */
const CURRENCY_RATES = { INR: 1, USD: 83.2, EUR: 90.5, GBP: 105.1, AED: 22.65, JPY: 0.56 };
const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState('INR');
  const [to, setTo] = useState('USD');
  const result = amount * CURRENCY_RATES[from] / CURRENCY_RATES[to];
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Convert</h2><span className="live-pill">Live</span></div>
          <MoneyField id="cur-amt" label="Amount" value={amount} onChange={setAmount} prefix="" />
          <Segmented options={Object.keys(CURRENCY_RATES).map((c) => ({ value: c, label: c }))} value={from} onChange={setFrom} label="From" />
          <Segmented options={Object.keys(CURRENCY_RATES).map((c) => ({ value: c, label: c }))} value={to} onChange={setTo} label="To" />
          <p className="panel-note">Approximate rates. Not live.</p>
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Converted</div>
          <div className="result-big">{result.toFixed(2)} {to}</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Number to Words ---------------- */
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function toWords(n) {
  if (n === 0) return 'Zero';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
  if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
  if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
  return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
}
const NumberToWords = () => {
  const [num, setNum] = useState(123456);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Number</h2><span className="live-pill">Live</span></div>
          <MoneyField id="ntw-num" label="Number" value={num} onChange={setNum} prefix="" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>In words</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Rupees</div>
          <div className="result-big" style={{ fontSize: 22 }}>{toWords(Math.round(num))} Rupees Only</div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Electricity Bill ---------------- */
const ElectricityBillCalculator = () => {
  const [units, setUnits] = useState(200);
  const bill = useMemo(() => {
    // Generic domestic slab: first 100 units @ ₹3, next 100 @ ₹5, above 200 @ ₹7.
    let amt = 0;
    let prev = 0;
    const slabs = [[100, 3], [200, 5], [Infinity, 7]];
    for (const [upto, rate] of slabs) {
      const chunk = Math.max(0, Math.min(units, upto) - prev);
      if (chunk <= 0 && Number.isFinite(upto)) { prev = upto; continue; }
      amt += chunk * rate;
      prev = upto;
      if (units <= upto) break;
    }
    const fixed = 50;
    const tax = amt * 0.05;
    return { energy: amt, fixed, tax, total: amt + fixed + tax };
  }, [units]);
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <RangeField label="Units consumed" value={units} min={0} max={1000} step={1} onChange={setUnits} display={`${units} units`} footLeft="0" footRight="1000" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Bill</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Total bill</div>
          <div className="result-big">{inr(bill.total)}</div>
          <div className="stat-grid dark">
            <Stat label="Energy charge" value={inr(bill.energy)} />
            <Stat label="Fixed charge" value={inr(bill.fixed)} />
            <Stat label="Tax (5%)" value={inr(bill.tax)} />
          </div>
          <p className="panel-note">Generic domestic slab: first 100 units @ ₹3, next 100 @ ₹5, above 200 @ ₹7. Add ₹50 fixed charge and 5% tax.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Discount ---------------- */
const DiscountCalculator = () => {
  const [price, setPrice] = useState(1000);
  const [discount, setDiscount] = useState(20);
  const [extra, setExtra] = useState(0);
  const final = price * (1 - discount / 100) * (1 - extra / 100);
  const saved = price - final;
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Inputs</h2><span className="live-pill">Live</span></div>
          <MoneyField id="disc-price" label="Original price" value={price} onChange={setPrice} />
          <RangeField label="Discount %" value={discount} min={0} max={90} step={1} onChange={setDiscount} display={pct(discount)} footLeft="0%" footRight="90%" />
          <RangeField label="Extra coupon %" value={extra} min={0} max={50} step={1} onChange={setExtra} display={pct(extra)} footLeft="0%" footRight="50%" />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Result</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Final price</div>
          <div className="result-big">{inr(final)}</div>
          <div className="stat-grid dark">
            <Stat label="You save" value={inr(saved)} tone="good" />
            <Stat label="Discount" value={pct(discount)} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Trip & Fuel Cost ---------------- */
const TripFuelCostCalculator = () => {
  const [distance, setDistance] = useState(100);
  const [mileage, setMileage] = useState(15);
  const [fuelPrice, setFuelPrice] = useState(100);
  const [toll, setToll] = useState(0);
  const fuel = distance / mileage * fuelPrice;
  const total = fuel + toll;
  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Trip</h2><span className="live-pill">Live</span></div>
          <RangeField label="Distance (km)" value={distance} min={1} max={2000} step={1} onChange={setDistance} display={`${distance} km`} footLeft="1" footRight="2000" />
          <RangeField label="Mileage (km/l)" value={mileage} min={5} max={40} step={0.5} onChange={setMileage} display={mileage} footLeft="5" footRight="40" />
          <MoneyField id="tf-fuel" label="Fuel price (per litre)" value={fuelPrice} onChange={setFuelPrice} prefix="₹" />
          <MoneyField id="tf-toll" label="Tolls / parking" value={toll} onChange={setToll} />
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Cost</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Total trip cost</div>
          <div className="result-big">{inr(total)}</div>
          <div className="stat-grid dark">
            <Stat label="Fuel cost" value={inr(fuel)} />
            <Stat label="Tolls" value={inr(toll)} />
            <Stat label="Fuel used (L)" value={(distance / mileage).toFixed(2)} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- GST Invoice Generator ---------------- */
const GstInvoiceGenerator = () => {
  const [seller, setSeller] = useState('Your business name');
  const [buyer, setBuyer] = useState('Customer name');
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('Design services');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const subtotal = amount * qty;
  const gst = subtotal * rate / 100;
  const total = subtotal + gst;

  const exportPdf = async () => {
    setBusy(true);
    setError('');
    try {
      await downloadInvoicePdf({ seller, buyer, invoiceNo, date, item: description, qty, unitPrice: amount, gstRate: rate });
    } catch (e) {
      setError(e?.message || 'Could not create the PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Invoice details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field"><label className="field-label">Seller</label><div className="number-box wide"><input value={seller} onChange={(e) => setSeller(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Buyer</label><div className="number-box wide"><input value={buyer} onChange={(e) => setBuyer(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Invoice number</label><div className="number-box wide"><input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Invoice date</label><div className="number-box wide"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Item / service</label><div className="number-box wide"><input value={description} onChange={(e) => setDescription(e.target.value)} /></div></div>
          <MoneyField id="inv-amt" label="Unit price" value={amount} onChange={setAmount} />
          <RangeField label="Quantity" value={qty} min={1} max={1000} step={1} onChange={setQty} display={qty} footLeft="1" footRight="1000" />
          <Segmented options={[{ value: 5, label: '5%' }, { value: 12, label: '12%' }, { value: 18, label: '18%' }, { value: 28, label: '28%' }]} value={rate} onChange={setRate} label="GST rate" />
          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Summary</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Total payable</div>
          <div className="result-big">{inr(total)}</div>
          <div className="stat-grid dark">
            <Stat label="Subtotal" value={inr(subtotal)} />
            <Stat label="GST" value={inr(gst)} tone="bad" />
            <Stat label="Quantity" value={qty} />
            <Stat label="Invoice" value={invoiceNo || '—'} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" className="btn solid" onClick={exportPdf} disabled={busy}>{busy ? 'Creating PDF…' : 'Download invoice PDF'}</button>
          </div>
          <p className="panel-note">The PDF includes seller, buyer, item, GST and total. Nothing is uploaded.</p>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Quotation & Receipt Maker ---------------- */
const QuotationReceiptMaker = () => {
  const [business, setBusiness] = useState('Your business name');
  const [client, setClient] = useState('Client name');
  const [quoteNo, setQuoteNo] = useState('Q-001');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('Website design and development');
  const [amount, setAmount] = useState(5000);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const afterDiscount = amount * (1 - discount / 100);
  const total = afterDiscount * (1 + tax / 100);

  const exportPdf = async () => {
    setBusy(true);
    setError('');
    try {
      await downloadQuotationPdf({ business, client, quoteNo, date, description, amount, discount, tax });
    } catch (e) {
      setError(e?.message || 'Could not create the PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="calculator">
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title"><h2>Quotation details</h2><span className="live-pill">Live</span></div>
          <div className="cal-field"><label className="field-label">From</label><div className="number-box wide"><input value={business} onChange={(e) => setBusiness(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Prepared for</label><div className="number-box wide"><input value={client} onChange={(e) => setClient(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Quote number</label><div className="number-box wide"><input value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Date</label><div className="number-box wide"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div></div>
          <div className="cal-field"><label className="field-label">Work / item</label><div className="number-box wide"><input value={description} onChange={(e) => setDescription(e.target.value)} /></div></div>
          <MoneyField id="q-amt" label="Amount" value={amount} onChange={setAmount} />
          <RangeField label="Discount %" value={discount} min={0} max={50} step={1} onChange={setDiscount} display={pct(discount)} footLeft="0%" footRight="50%" />
          <RangeField label="Tax %" value={tax} min={0} max={28} step={1} onChange={setTax} display={pct(tax)} footLeft="0%" footRight="28%" />
          {error && <p className="panel-note" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
        <div className="panel result-panel">
          <div className="panel-title"><h2>Total</h2><span className="live-pill">Live</span></div>
          <div className="result-label">Quotation total</div>
          <div className="result-big">{inr(total)}</div>
          <div className="stat-grid dark">
            <Stat label="Amount" value={inr(amount)} />
            <Stat label="Discount" value={inr(amount - afterDiscount)} tone="bad" />
            <Stat label="Tax" value={inr(total - afterDiscount)} />
            <Stat label="Quote" value={quoteNo || '—'} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" className="btn solid" onClick={exportPdf} disabled={busy}>{busy ? 'Creating PDF…' : 'Download quotation PDF'}</button>
          </div>
          <p className="panel-note">The PDF is a clean quotation, not a tax invoice. Nothing is uploaded.</p>
        </div>
      </div>
    </section>
  );
};

const COMPONENTS = {
  'loan-calculator': LoanCalculator,
  'rent-vs-buy-calculator': RentVsBuyCalculator,
  'hra-exemption-calculator': HraCalculator,
  'gratuity-calculator': GratuityCalculator,
  'pf-calculator': PfCalculator,
  'gst-calculator': GstCalculator,
  'step-up-sip-calculator': StepUpSipCalculator,
  'lumpsum-calculator': LumpsumCalculator,
  'rd-calculator': RdCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'simple-interest-calculator': SimpleInterestCalculator,
  'age-calculator': AgeCalculator,
  'cgpa-to-percentage-calculator': CgpaToPercentage,
  'percentage-calculator': PercentageCalculator,
  'bmi-calculator': BmiCalculator,
  'time-calculator': TimeCalculator,
  'date-difference-calculator': DateDifferenceCalculator,
  'working-days-calculator': WorkingDaysCalculator,
  'unit-converter': UnitConverter,
  'currency-converter': CurrencyConverter,
  'number-to-words': NumberToWords,
  'electricity-bill-calculator': ElectricityBillCalculator,
  'discount-calculator': DiscountCalculator,
  'trip-fuel-cost-calculator': TripFuelCostCalculator,
  'gst-invoice-generator': GstInvoiceGenerator,
  'quotation-receipt-maker': QuotationReceiptMaker,
};

export const GenericCalc = ({ slug, title }) => {
  const Comp = COMPONENTS[slug];
  if (!Comp) {
    return (
      <div className="shell section" style={{ textAlign: 'center', padding: '48px 22px' }}>
        <h2>{title}</h2>
        <p className="muted">Coming soon.</p>
      </div>
    );
  }
  return <Comp />;
};

export default GenericCalc;
