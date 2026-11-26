import { useMemo, useRef, useState } from 'react';
import { salaryBreakup } from './salary';
import { computeTax } from './tax';
import { inr, compact, pct } from './format';
import { MoneyField, RangeField, Stat, TabsBar, Toggle } from '../components/CalcUI';

const TABS = [
  { key: 'breakup', label: 'CTC to take-home', color: '#067a55' },
  { key: 'structure', label: 'Salary structure', color: '#0f766e' },
  { key: 'tax', label: 'Income tax', color: '#d97706' }
];

const BASIC_CHIPS = [30, 40, 50].map((v) => ({ label: `${v}%`, value: v }));
const HRA_CHIPS = [40, 50].map((v) => ({ label: `${v}%`, value: v }));

export const SalaryCalculator = ({ title = 'In-hand Salary Calculator' }) => {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(40);
  const [hraPct, setHraPct] = useState(50);
  const [metro, setMetro] = useState(true);
  const [tab, setTab] = useState('breakup');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const result = useMemo(
    () => salaryBreakup({ ctc, basicPct, hraPct, metro }),
    [ctc, basicPct, hraPct, metro]
  );
  const tax = useMemo(() => computeTax({ gross: result.gross, salaried: true }), [result.gross]);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };

  const copySummary = async () => {
    const text = `Salary plan: CTC ${inr(ctc)}. Monthly take-home about ${inr(
      result.monthlyTake
    )} under the new regime, after PF, professional tax and income tax. Made with 3toOne Calc.`;
    try {
      await navigator.clipboard.writeText(text);
      notify('Summary copied');
    } catch {
      notify('Copy is blocked in this browser');
    }
  };

  const deductions = result.deductions + result.employerPf + result.gratuity;
  const keepShare = ctc > 0 ? (result.annualTake / ctc) * 100 : 0;

  return (
    <section className="calculator" aria-label={title}>
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title">
            <h2>Your package</h2>
            <span className="live-pill">Live</span>
          </div>

          <MoneyField
            id="sal-ctc"
            label="Annual CTC"
            value={ctc}
            onChange={setCtc}
            max={1000000000}
            chips={[600000, 1200000, 1800000, 2500000, 4000000].map((v) => ({ label: compact(v), value: v }))}
          />

          <RangeField
            label="Basic salary, as a share of CTC"
            value={basicPct}
            min={30}
            max={60}
            step={1}
            onChange={setBasicPct}
            display={`${basicPct}%`}
            chips={BASIC_CHIPS}
            footLeft="30%"
            footRight="60%"
          />

          <RangeField
            label="HRA, as a share of basic"
            value={hraPct}
            min={30}
            max={50}
            step={1}
            onChange={setHraPct}
            display={`${hraPct}%`}
            chips={HRA_CHIPS}
            footLeft="30%"
            footRight="50%"
          />

          <Toggle
            id="sal-metro"
            label="I live in a metro city (HRA can be 50% of basic)"
            checked={metro}
            onChange={setMetro}
          />

          <p className="panel-note">
            Assumes 12% employee and employer PF, 4.81% gratuity inside CTC, and
            ₹2,400 professional tax a year. New tax regime.
          </p>
        </div>

        <div className="panel result-panel">
          <div className="panel-title">
            <h2>Your result</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="result-label">Monthly take-home</div>
          <div className="result-big">{inr(result.monthlyTake)}</div>

          <div className="split-bar" aria-hidden="true">
            <span className="split-principal" style={{ width: `${keepShare}%` }} />
            <span className="split-interest" style={{ width: `${100 - keepShare}%` }} />
          </div>
          <div className="legend-row">
            <span><b className="legend-dot principal" />You keep <strong>{inr(result.annualTake)}</strong></span>
            <span><b className="legend-dot interest" />Deductions <strong>{inr(deductions)}</strong></span>
          </div>

          <div className="stat-grid dark">
            <Stat label="Monthly gross salary" value={inr(result.monthlyGross)} />
            <Stat label="Employee PF per month" value={inr(result.employeePf / 12)} />
            <Stat label="Income tax per month" value={inr(result.incomeTax / 12)} tone={result.incomeTax > 0 ? 'bad' : 'good'} />
            <Stat label="Share of CTC you keep" value={pct(keepShare, 0)} />
          </div>

          <div className="result-actions">
            <button type="button" className="btn solid" onClick={copySummary}>Copy summary</button>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Estimates for planning only. Real structures vary by employer, city and
        declarations.
      </p>

      <div className="deep-card" id="go-deeper">
        <div className="deep-head">
          <div>
            <h3>Go deeper, only if you want to</h3>
            <p>Everything below uses the package you set above.</p>
          </div>
          <span className="deep-hint">All free</span>
        </div>

        <TabsBar tabs={TABS} value={tab} onChange={setTab} label="Salary details" />

        <div className="deep-body" role="tabpanel">
          {tab === 'breakup' && (
            <>
              <div className="table-wrap">
                <table className="schedule-table">
                  <thead>
                    <tr><th>ITEM</th><th>YEARLY</th><th>MONTHLY</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>CTC</td><td>{inr(result.ctc)}</td><td>{inr(result.ctc / 12)}</td></tr>
                    <tr><td>Employer PF</td><td>−{inr(result.employerPf)}</td><td>−{inr(result.employerPf / 12)}</td></tr>
                    <tr><td>Gratuity (inside CTC)</td><td>−{inr(result.gratuity)}</td><td>−{inr(result.gratuity / 12)}</td></tr>
                    <tr><td><b>Gross salary</b></td><td><b>{inr(result.gross)}</b></td><td><b>{inr(result.monthlyGross)}</b></td></tr>
                    <tr><td>Employee PF</td><td>−{inr(result.employeePf)}</td><td>−{inr(result.employeePf / 12)}</td></tr>
                    <tr><td>Professional tax</td><td>−{inr(result.professionalTax)}</td><td>−{inr(result.professionalTax / 12)}</td></tr>
                    <tr><td>Income tax (new regime)</td><td>−{inr(result.incomeTax)}</td><td>−{inr(result.incomeTax / 12)}</td></tr>
                    <tr><td><b>Take-home</b></td><td><b>{inr(result.annualTake)}</b></td><td><b>{inr(result.monthlyTake)}</b></td></tr>
                  </tbody>
                </table>
              </div>
              <p className="panel-note">
                Take-home is what reaches your bank account. Employer PF and
                gratuity are part of your CTC but are not paid to you monthly.
              </p>
            </>
          )}

          {tab === 'structure' && (
            <div className="panel-grid">
              <div>
                <RangeField
                  label="Basic salary share"
                  value={basicPct}
                  min={30}
                  max={60}
                  step={1}
                  onChange={setBasicPct}
                  display={`${basicPct}% of CTC`}
                  chips={BASIC_CHIPS}
                  footLeft="30%"
                  footRight="60%"
                />
                <RangeField
                  label="HRA share of basic"
                  value={hraPct}
                  min={30}
                  max={50}
                  step={1}
                  onChange={setHraPct}
                  display={`${hraPct}%`}
                  chips={HRA_CHIPS}
                  footLeft="30%"
                  footRight="50%"
                />
                <p className="panel-note">
                  A higher basic means more PF and gratuity, but less cash in hand
                  each month. A lower basic means more take-home now and a smaller
                  retirement corpus.
                </p>
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label="Basic salary" value={inr(result.basic)} />
                  <Stat label="HRA" value={inr(result.hra)} />
                  <Stat label="Special allowance" value={inr(result.special)} />
                  <Stat label="Employer PF" value={inr(result.employerPf)} />
                  <Stat label="Gratuity" value={inr(result.gratuity)} />
                  <Stat label="Gross salary" value={inr(result.gross)} />
                </div>
                <p className="panel-note">
                  Special allowance is the balancing figure after basic and HRA.
                  Metro status only affects HRA at 50% of basic.
                </p>
              </div>
            </div>
          )}

          {tab === 'tax' && (
            <div className="panel-grid">
              <div>
                <p className="panel-note" style={{ marginTop: 0 }}>
                  Tax on your gross salary under the new regime for FY 2025-26,
                  after the ₹75,000 standard deduction.
                </p>
                <div className="stat-grid" style={{ marginTop: 12 }}>
                  <Stat label="Gross salary" value={inr(tax.gross)} />
                  <Stat label="Standard deduction" value={inr(75000)} />
                  <Stat label="Taxable income" value={inr(tax.new.taxable)} />
                  <Stat label="Tax + 4% cess" value={inr(tax.new.total)} tone={tax.new.total > 0 ? 'bad' : 'good'} />
                </div>
                <p className="panel-note">
                  Tax is deducted monthly as TDS by your employer, so the
                  take-home figure above already accounts for it.
                </p>
              </div>
              <div>
                <div className="table-wrap">
                  <table className="schedule-table">
                    <thead>
                      <tr><th>SLAB</th><th>RATE</th><th>TAX</th></tr>
                    </thead>
                    <tbody>
                      {tax.new.rows.map((row) => (
                        <tr key={`${row.from}-${row.rate}`}>
                          <td>{row.to === Infinity ? `Above ${compact(row.from)}` : `${compact(row.from)} – ${compact(row.to)}`}</td>
                          <td>{row.rate}%</td>
                          <td>{inr(row.tax)}</td>
                        </tr>
                      ))}
                      <tr><td>Cess</td><td>4%</td><td>{inr(tax.new.cess)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </section>
  );
};

export default SalaryCalculator;
