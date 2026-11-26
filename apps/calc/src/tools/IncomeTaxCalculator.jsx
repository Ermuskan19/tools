import { useMemo, useRef, useState } from 'react';
import { computeTax, LIMITS } from './tax';
import { inr, compact, pct } from './format';
import { MoneyField, Stat, TabsBar, Toggle } from '../components/CalcUI';

const TABS = [
  { key: 'compare', label: 'Old vs new', color: '#067a55' },
  { key: 'deductions', label: 'Deductions', color: '#2563eb' },
  { key: 'slabs', label: 'Slab by slab', color: '#7c3aed' }
];

const regimeName = (key) => (key === 'new' ? 'New regime' : 'Old regime');

const SlabTable = ({ rows, income }) => (
  <div className="table-wrap">
    <table className="schedule-table">
      <thead>
        <tr><th>SLAB</th><th>RATE</th><th>INCOME IN SLAB</th><th>TAX</th></tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.from}-${row.rate}`}>
            <td>{row.to === Infinity ? `Above ${compact(row.from)}` : `${compact(row.from)} – ${compact(row.to)}`}</td>
            <td>{row.rate}%</td>
            <td>{inr(row.amount)}</td>
            <td>{inr(row.tax)}</td>
          </tr>
        ))}
        <tr>
          <td>Total</td>
          <td />
          <td>{inr(income)}</td>
          <td>{inr(rows.reduce((sum, row) => sum + row.tax, 0))}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const IncomeTaxCalculator = ({ title = 'Income Tax Calculator' }) => {
  const [gross, setGross] = useState(1500000);
  const [salaried, setSalaried] = useState(true);
  const [c80, setC80] = useState(150000);
  const [d80, setD80] = useState(25000);
  const [home, setHome] = useState(0);
  const [nps, setNps] = useState(0);
  const [tab, setTab] = useState('compare');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const result = useMemo(
    () => computeTax({ gross, salaried, deductions: { c80, d80, home, nps } }),
    [gross, salaried, c80, d80, home, nps]
  );

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };

  const copySummary = async () => {
    const text = `${regimeName(result.better)} is better for a gross income of ${inr(gross)}. Tax ${inr(
      result[result.better].total
    )} vs ${inr(result[result.better === 'new' ? 'old' : 'new'].total)}. Saves ${inr(
      result.saving
    )} a year. Made with 3toOne Calc.`;
    try {
      await navigator.clipboard.writeText(text);
      notify('Summary copied');
    } catch {
      notify('Copy is blocked in this browser');
    }
  };

  const better = result[result.better];
  const maxTax = Math.max(result.old.total, result.new.total, 1);

  return (
    <section className="calculator" aria-label={title}>
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title">
            <h2>Your income</h2>
            <span className="live-pill">Live</span>
          </div>

          <MoneyField
            id="tax-gross"
            label="Annual gross income"
            value={gross}
            onChange={setGross}
            max={100000000}
            chips={[600000, 1000000, 1500000, 2500000, 5000000].map((v) => ({ label: compact(v), value: v }))}
          />

          <Toggle
            id="tax-salaried"
            label="Salaried (apply the standard deduction)"
            checked={salaried}
            onChange={setSalaried}
          />

          <p className="panel-note">
            For a resident individual below 60, FY 2025-26. Surcharge above ₹50
            lakh is not included.
          </p>

          <div className="callout">
            <b>Both regimes, one answer</b>
            <span>
              We compute the tax under both regimes and tell you which one leaves
              more in your pocket. The new regime gives up most deductions, so the
              old regime can still win if you claim a lot.
            </span>
          </div>
        </div>

        <div className="panel result-panel">
          <div className="panel-title">
            <h2>Your result</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="result-label">{regimeName(result.better)} costs less</div>
          <div className="result-big">{inr(better.total)}</div>

          <div className="tax-bars">
            <div className="tax-bar-row">
              <span>New regime</span>
              <div className="tax-bar-track">
                <i className={result.better === 'new' ? 'win' : ''} style={{ width: `${(result.new.total / maxTax) * 100}%` }} />
              </div>
              <b>{inr(result.new.total)}</b>
            </div>
            <div className="tax-bar-row">
              <span>Old regime</span>
              <div className="tax-bar-track">
                <i className={result.better === 'old' ? 'win' : ''} style={{ width: `${(result.old.total / maxTax) * 100}%` }} />
              </div>
              <b>{inr(result.old.total)}</b>
            </div>
          </div>

          <div className="stat-grid dark">
            <Stat label="You save per year" value={inr(result.saving)} tone="good" />
            <Stat label="Taxable income (new)" value={inr(result.new.taxable)} />
            <Stat label="Taxable income (old)" value={inr(result.old.taxable)} />
            <Stat label="Deductions used" value={inr(result.deductionsUsed)} />
          </div>

          <p className="safety-strip good" style={{ cursor: 'default' }}>
            {result.saving > 500
              ? `Pick the ${result.better} regime and keep ${inr(result.saving)} more this year.`
              : 'Both regimes cost about the same for you.'}
          </p>

          <div className="result-actions">
            <button type="button" className="btn solid" onClick={copySummary}>Copy summary</button>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Estimates for planning only. Salary structure, exemptions and surcharge can
        change your final tax. Check with a tax professional before filing.
      </p>

      <div className="deep-card" id="go-deeper">
        <div className="deep-head">
          <div>
            <h3>Go deeper, only if you want to</h3>
            <p>Everything below uses the income you set above.</p>
          </div>
          <span className="deep-hint">All free</span>
        </div>

        <TabsBar tabs={TABS} value={tab} onChange={setTab} label="Tax details" />

        <div className="deep-body" role="tabpanel">
          {tab === 'compare' && (
            <>
              <div className="table-wrap" style={{ marginBottom: 16 }}>
                <table className="schedule-table">
                  <thead>
                    <tr><th>ITEM</th><th>NEW REGIME</th><th>OLD REGIME</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Gross income</td>
                      <td>{inr(result.gross)}</td>
                      <td>{inr(result.gross)}</td>
                    </tr>
                    <tr>
                      <td>Standard deduction</td>
                      <td>{inr(salaried ? LIMITS.standardNew : 0)}</td>
                      <td>{inr(salaried ? LIMITS.standardOld : 0)}</td>
                    </tr>
                    <tr>
                      <td>Other deductions</td>
                      <td>Not allowed</td>
                      <td>{inr(result.deductionsUsed)}</td>
                    </tr>
                    <tr>
                      <td>Taxable income</td>
                      <td>{inr(result.new.taxable)}</td>
                      <td>{inr(result.old.taxable)}</td>
                    </tr>
                    <tr>
                      <td>Tax before cess</td>
                      <td>{inr(result.new.tax)}</td>
                      <td>{inr(result.old.tax)}</td>
                    </tr>
                    <tr>
                      <td>Health &amp; education cess (4%)</td>
                      <td>{inr(result.new.cess)}</td>
                      <td>{inr(result.old.cess)}</td>
                    </tr>
                    <tr>
                      <td><b>Total tax</b></td>
                      <td><b>{inr(result.new.total)}</b></td>
                      <td><b>{inr(result.old.total)}</b></td>
                    </tr>
                    <tr>
                      <td>Effective tax rate</td>
                      <td>{gross > 0 ? pct((result.new.total / gross) * 100, 1) : '—'}</td>
                      <td>{gross > 0 ? pct((result.old.total / gross) * 100, 1) : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="panel-note">
                {result.new.rebate && 'The new regime rebate wipes out tax up to ₹12 lakh of taxable income. '}
                {result.old.rebate && 'The old regime rebate wipes out tax up to ₹5 lakh of taxable income. '}
                The {regimeName(result.better).toLowerCase()} is cheaper by{' '}
                <strong>{inr(result.saving)}</strong> a year, about {inr(result.saving / 12)} a month.
              </p>
            </>
          )}

          {tab === 'deductions' && (
            <div className="panel-grid">
              <div>
                <MoneyField
                  id="tax-80c"
                  label="80C investments (PF, ELSS, life insurance)"
                  value={c80}
                  onChange={setC80}
                  max={LIMITS.c80}
                  help={`Capped at ${inr(LIMITS.c80)}.`}
                />
                <MoneyField
                  id="tax-80d"
                  label="80D health insurance premium"
                  value={d80}
                  onChange={setD80}
                  max={LIMITS.d80}
                  help={`Capped at ${inr(LIMITS.d80)} for you and your family.`}
                />
                <MoneyField
                  id="tax-home"
                  label="Home loan interest, self-occupied"
                  value={home}
                  onChange={setHome}
                  max={LIMITS.homeInterest}
                  help={`Capped at ${inr(LIMITS.homeInterest)} under Section 24(b).`}
                />
                <MoneyField
                  id="tax-nps"
                  label="NPS contribution, extra 80CCD(1B)"
                  value={nps}
                  onChange={setNps}
                  max={LIMITS.nps}
                  help={`Capped at ${inr(LIMITS.nps)}.`}
                />
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label="Deductions actually used" value={inr(result.deductionsUsed)} />
                  <Stat label="Old regime taxable income" value={inr(result.old.taxable)} tone="good" />
                  <Stat label="Old regime tax" value={inr(result.old.total)} />
                  <Stat label="Better regime" value={regimeName(result.better)} tone="good" />
                </div>
                <p className="panel-note">
                  Every rupee of deduction above reduces old-regime taxable income
                  (within the caps). The new regime allows none of these, which is
                  why a higher basic income can still favour it.
                </p>
              </div>
            </div>
          )}

          {tab === 'slabs' && (
            <div className="panel-grid">
              <div>
                <h4 className="mini-head">New regime slabs</h4>
                <SlabTable rows={result.new.rows} income={result.new.taxable} />
                <p className="panel-note">
                  Taxable {inr(result.new.taxable)} · tax before cess{' '}
                  {inr(result.new.tax)} · total {inr(result.new.total)}.
                </p>
              </div>
              <div>
                <h4 className="mini-head">Old regime slabs</h4>
                <SlabTable rows={result.old.rows} income={result.old.taxable} />
                <p className="panel-note">
                  Taxable {inr(result.old.taxable)} · tax before cess{' '}
                  {inr(result.old.tax)} · total {inr(result.old.total)}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </section>
  );
};

export default IncomeTaxCalculator;
