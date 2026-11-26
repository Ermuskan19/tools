import { useMemo, useRef, useState } from 'react';
import { fdBreakdown, fdPayout, fdYearly, fdRateLadder } from './fd';
import { inr, compact, pct } from './format';
import { MoneyField, RangeField, Stat, TabsBar, Toggle, Segmented } from '../components/CalcUI';

const TABS = [
  { key: 'growth', label: 'Growth', color: '#067a55' },
  { key: 'payout', label: 'Payout vs cumulative', color: '#0f766e' },
  { key: 'rates', label: 'Compare rates', color: '#2563eb' },
  { key: 'tax', label: 'Tax on interest', color: '#d97706' }
];

const durationLabel = (months) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!m) return `${y} ${y === 1 ? 'year' : 'years'}`;
  if (!y) return `${m} months`;
  return `${y} yr ${m} mo`;
};

const SLABS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' }
];

export const FdCalculator = ({ title = 'FD Calculator' }) => {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(7.25);
  const [months, setMonths] = useState(60);
  const [slab, setSlab] = useState(30);
  const [useTds, setUseTds] = useState(true);
  const [tab, setTab] = useState('growth');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const result = useMemo(
    () => fdBreakdown({ principal, rate, months, slab, tds: useTds }),
    [principal, rate, months, slab, useTds]
  );
  const yearly = useMemo(() => fdYearly({ principal, rate, months }), [principal, rate, months]);
  const payout = fdPayout({ principal, rate, months });
  const ladder = fdRateLadder({ principal, rate, months });

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };

  const copySummary = async () => {
    const text = `FD plan: ${inr(principal)} at ${pct(rate)} for ${durationLabel(months)}. Maturity ${inr(
      result.maturity
    )}, interest ${inr(result.interest)}. Made with 3toOne Calc.`;
    try {
      await navigator.clipboard.writeText(text);
      notify('Summary copied');
    } catch {
      notify('Copy is blocked in this browser');
    }
  };

  const principalShare = result.maturity > 0 ? (principal / result.maturity) * 100 : 100;
  const maxYear = Math.max(...yearly.map((y) => y.value), 1);
  const bestRate = ladder.reduce((best, row) => (row.maturity > best.maturity ? row : best), ladder[0]);

  return (
    <section className="calculator" aria-label={title}>
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title">
            <h2>Your deposit</h2>
            <span className="live-pill">Live</span>
          </div>

          <MoneyField
            id="fd-principal"
            label="Deposit amount"
            value={principal}
            onChange={setPrincipal}
            max={1000000000}
            chips={[100000, 500000, 1000000, 2500000].map((v) => ({ label: compact(v), value: v }))}
          />

          <RangeField
            label="Interest rate (per year)"
            value={rate}
            min={1}
            max={15}
            step={0.05}
            onChange={setRate}
            display={pct(rate)}
            footLeft="1%"
            footRight="15%"
          />

          <RangeField
            label="Tenure"
            value={months}
            min={3}
            max={120}
            step={3}
            onChange={setMonths}
            display={durationLabel(months)}
            chips={[12, 24, 36, 60, 120].map((v) => ({ label: durationLabel(v), value: v }))}
            footLeft="3 months"
            footRight="10 years"
          />

          <div className="slider-block">
            <span className="field-label">Your tax slab</span>
            <Segmented options={SLABS} value={slab} onChange={setSlab} className="four-up" label="Tax slab" />
          </div>

          <Toggle
            id="fd-tds"
            label="Show the 10% TDS banks deduct when interest is over ₹40,000"
            checked={useTds}
            onChange={setUseTds}
          />

          <p className="panel-note">
            Cumulative FD with quarterly compounding, the most common bank option.
            TDS is a prepayment of tax, not an extra tax.
          </p>
        </div>

        <div className="panel result-panel">
          <div className="panel-title">
            <h2>Your result</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="result-label">Maturity value</div>
          <div className="result-big">{inr(result.maturity)}</div>

          <div className="split-bar" aria-hidden="true">
            <span className="split-principal" style={{ width: `${principalShare}%` }} />
            <span className="split-interest" style={{ width: `${100 - principalShare}%` }} />
          </div>
          <div className="legend-row">
            <span><b className="legend-dot principal" />Principal <strong>{inr(principal)}</strong></span>
            <span><b className="legend-dot interest" />Interest <strong>{inr(result.interest)}</strong></span>
          </div>

          <div className="stat-grid dark">
            <Stat label="Interest earned" value={inr(result.interest)} tone="good" />
            <Stat label="Effective annual yield" value={pct(result.yieldPct)} />
            <Stat label="Tax on interest" value={inr(result.tax)} tone={result.tax > 0 ? 'bad' : 'good'} />
            <Stat label="Value after tax" value={inr(result.afterTax)} />
          </div>

          <div className="result-actions">
            <button type="button" className="btn solid" onClick={copySummary}>Copy summary</button>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Estimates for planning only. Bank rates, compounding and TDS rules can differ.
      </p>

      <div className="deep-card" id="go-deeper">
        <div className="deep-head">
          <div>
            <h3>Go deeper, only if you want to</h3>
            <p>Everything below uses the deposit you set above.</p>
          </div>
          <span className="deep-hint">All free</span>
        </div>

        <TabsBar tabs={TABS} value={tab} onChange={setTab} label="FD details" />

        <div className="deep-body" role="tabpanel">
          {tab === 'growth' && (
            <>
              <div className="year-chart" role="img" aria-label="Deposit value each year">
                {yearly.map((row) => (
                  <div className="year-bar" key={row.year} title={`Year ${row.year}: ${inr(row.value)}, interest ${inr(row.interest)}`}>
                    <div className="year-stack" style={{ height: `${Math.max((row.value / maxYear) * 100, 2)}%` }}>
                      <span className="bar-interest" style={{ flex: row.interest }} />
                      <span className="bar-principal" style={{ flex: principal }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-caption">
                <span>Year 1</span>
                <span>Year {yearly.length}</span>
              </div>

              <div className="table-wrap">
                <table className="schedule-table">
                  <thead>
                    <tr><th>YEAR</th><th>VALUE</th><th>INTEREST</th><th>GROWTH</th></tr>
                  </thead>
                  <tbody>
                    {yearly.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{inr(row.value)}</td>
                        <td>{inr(row.interest)}</td>
                        <td>{pct((row.value / principal - 1) * 100, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'payout' && (
            <div className="panel-grid">
              <div>
                <p className="panel-note">
                  A payout FD pays the interest to you regularly and returns the
                  principal at the end. Useful when you need the income.
                </p>
                <div className="stat-grid" style={{ marginTop: 12 }}>
                  <Stat label="Interest each month" value={inr(payout.monthly)} tone="good" />
                  <Stat label="Interest over the term" value={inr(payout.interest)} />
                  <Stat label="Principal returned" value={inr(payout.principal)} />
                  <Stat label="Total received" value={inr(payout.principal + payout.interest)} />
                </div>
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label="Cumulative FD value" value={inr(result.maturity)} tone="good" />
                  <Stat label="Payout FD total" value={inr(payout.principal + payout.interest)} />
                  <Stat label="Extra from compounding" value={inr(result.maturity - payout.principal - payout.interest)} tone="good" />
                  <Stat label="Monthly income instead" value={inr(payout.monthly)} />
                </div>
                <p className="panel-note">
                  The cumulative option earns interest on interest. The payout
                  option gives you cash flow but a smaller total.
                </p>
              </div>
            </div>
          )}

          {tab === 'rates' && (
            <>
              <p className="panel-note" style={{ marginTop: 0, marginBottom: 12 }}>
                The same deposit at rates around your {pct(rate)}. A small rate
                difference matters more than it looks over {durationLabel(months)}.
              </p>
              <div className="table-wrap">
                <table className="schedule-table">
                  <thead>
                    <tr><th>RATE</th><th>MATURITY</th><th>INTEREST</th><th>VS YOURS</th></tr>
                  </thead>
                  <tbody>
                    {ladder.map((row) => (
                      <tr key={row.rate}>
                        <td>{pct(row.rate)}{row.rate === rate ? ' •' : ''}</td>
                        <td>{inr(row.maturity)}</td>
                        <td>{inr(row.maturity - principal)}</td>
                        <td>{row.maturity === bestRate.maturity ? 'Best' : `${row.maturity > result.maturity ? '+' : ''}${inr(row.maturity - result.maturity)}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="panel-note">
                Laddering means splitting one deposit across different tenures, so
                you are not locked in at a single rate.
              </p>
            </>
          )}

          {tab === 'tax' && (
            <div className="panel-grid">
              <div>
                <Segmented options={SLABS} value={slab} onChange={setSlab} className="four-up" label="Tax slab" />
                <p className="panel-note">
                  FD interest is taxed at your slab rate. Banks cut 10% TDS once
                  interest crosses ₹40,000 in a year (₹50,000 for senior citizens).
                  You still pay the rest through your return.
                </p>
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label="Interest earned" value={inr(result.interest)} />
                  <Stat label="Tax at your slab" value={inr(result.tax)} tone="bad" />
                  <Stat label="TDS the bank may cut" value={inr(result.tds)} />
                  <Stat label="Net interest" value={inr(result.netInterest)} tone="good" />
                  <Stat label="Maturity after tax" value={inr(result.afterTax)} />
                  <Stat label="Post-tax yield" value={principal > 0 && months > 0 ? pct(((result.afterTax / principal) ** (12 / months) - 1) * 100) : '—'} />
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

export default FdCalculator;
