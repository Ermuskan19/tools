import { useMemo, useRef, useState } from 'react';
import { sipProject, requiredMonthly, realValue } from './sip';
import { inr, compact, pct } from './format';
import { MoneyField, RangeField, Stat, TabsBar } from '../components/CalcUI';

const TABS = [
  { key: 'growth', label: 'Growth year by year', color: '#067a55' },
  { key: 'stepup', label: 'Step up the SIP', color: '#0f766e' },
  { key: 'goal', label: 'Hit a goal', color: '#2563eb' },
  { key: 'inflation', label: 'After inflation', color: '#d97706' }
];

const YEAR_CHIPS = [5, 10, 15, 20, 25].map((v) => ({ label: `${v} yrs`, value: v }));
const RATE_CHIPS = [8, 10, 12, 14, 15].map((v) => ({ label: `${v}%`, value: v }));
const STEP_CHIPS = [0, 5, 10, 15].map((v) => ({ label: v ? `+${v}%` : 'None', value: v }));
const INFLATION_CHIPS = [4, 6, 7].map((v) => ({ label: `${v}%`, value: v }));

export const SipCalculator = ({ title = 'SIP Calculator' }) => {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [stepUp, setStepUp] = useState(0);
  const [lumpsum, setLumpsum] = useState(0);
  const [inflation, setInflation] = useState(6);
  const [target, setTarget] = useState(10000000);
  const [tab, setTab] = useState('growth');
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  const projection = useMemo(
    () => sipProject({ monthly, years, rate, stepUp, lumpsum }),
    [monthly, years, rate, stepUp, lumpsum]
  );
  const withoutStepUp = useMemo(
    () => sipProject({ monthly, years, rate, stepUp: 0, lumpsum }),
    [monthly, years, rate, lumpsum]
  );
  const todayValue = realValue(projection.value, inflation, years);
  const needed = requiredMonthly({ target, years, rate, lumpsum });
  const monthlyAtEnd = monthly * Math.pow(1 + stepUp / 100, Math.max(0, years - 1));
  const investedShare = projection.value > 0 ? (projection.invested / projection.value) * 100 : 100;

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };

  const copySummary = async () => {
    const text = `SIP plan: ${inr(monthly)} a month for ${years} years at ${rate}% expected return. Invested ${inr(
      projection.invested
    )}, projected value ${inr(projection.value)}, gains ${inr(projection.gains)}. Made with 3toOne Calc.`;
    try {
      await navigator.clipboard.writeText(text);
      notify('Summary copied');
    } catch {
      notify('Copy is blocked in this browser');
    }
  };

  const maxYear = Math.max(...projection.yearly.map((y) => y.value), 1);
  const extraFromStepUp = projection.value - withoutStepUp.value;

  return (
    <section className="calculator" aria-label={title}>
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title">
            <h2>Your investment</h2>
            <span className="live-pill">Live</span>
          </div>

          <MoneyField
            id="sip-monthly"
            label="Monthly investment"
            value={monthly}
            onChange={setMonthly}
            max={10000000}
            chips={[1000, 5000, 10000, 25000].map((v) => ({ label: compact(v), value: v }))}
          />

          <RangeField
            label="Expected return (per year)"
            value={rate}
            min={1}
            max={30}
            step={0.5}
            onChange={setRate}
            display={pct(rate, 1)}
            chips={RATE_CHIPS}
            footLeft="1%"
            footRight="30%"
          />

          <RangeField
            label="How long you invest"
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            display={`${years} ${years === 1 ? 'year' : 'years'}`}
            chips={YEAR_CHIPS}
            footLeft="1 yr"
            footRight="40 yrs"
          />

          <MoneyField
            id="sip-lumpsum"
            label="Starting amount (optional)"
            value={lumpsum}
            onChange={setLumpsum}
            max={100000000}
            chips={[0, 100000, 500000].map((v) => ({ label: v ? compact(v) : 'None', value: v }))}
          />

          <p className="panel-note">
            Returns are not guaranteed. This assumes the same yearly return every
            year, which real markets never deliver.
          </p>
        </div>

        <div className="panel result-panel">
          <div className="panel-title">
            <h2>Your result</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="result-label">Projected value after {years} years</div>
          <div className="result-big">{inr(projection.value)}</div>

          <div className="split-bar" aria-hidden="true">
            <span className="split-principal" style={{ width: `${investedShare}%` }} />
            <span className="split-interest" style={{ width: `${100 - investedShare}%` }} />
          </div>
          <div className="legend-row">
            <span><b className="legend-dot principal" />Invested <strong>{inr(projection.invested)}</strong></span>
            <span><b className="legend-dot interest" />Gains <strong>{inr(projection.gains)}</strong></span>
          </div>

          <div className="stat-grid dark">
            <Stat label="Total invested" value={inr(projection.invested)} />
            <Stat label="Wealth gained" value={inr(projection.gains)} tone="good" />
            <Stat label="Value in today's money" value={inr(todayValue)} />
            <Stat label="Growth multiple" value={projection.invested > 0 ? `${+(projection.value / projection.invested).toFixed(2)}×` : '—'} />
          </div>

          <div className="result-actions">
            <button type="button" className="btn solid" onClick={copySummary}>Copy summary</button>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Estimates for planning only. Mutual fund returns vary and are not fixed.
      </p>

      <div className="deep-card" id="go-deeper">
        <div className="deep-head">
          <div>
            <h3>Go deeper, only if you want to</h3>
            <p>Everything below uses the investment you set above.</p>
          </div>
          <span className="deep-hint">All free</span>
        </div>

        <TabsBar tabs={TABS} value={tab} onChange={setTab} label="SIP details" />

        <div className="deep-body" role="tabpanel">
          {tab === 'growth' && (
            <>
              <div className="year-chart" role="img" aria-label="Invested amount and gains each year">
                {projection.yearly.map((row) => (
                  <div className="year-bar" key={row.year} title={`Year ${row.year}: invested ${inr(row.invested)}, value ${inr(row.value)}`}>
                    <div className="year-stack" style={{ height: `${Math.max((row.value / maxYear) * 100, 2)}%` }}>
                      <span className="bar-interest" style={{ flex: row.gains }} />
                      <span className="bar-principal" style={{ flex: row.invested }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-caption">
                <span>Year 1</span>
                <span>Year {projection.yearly.length}</span>
              </div>

              <div className="table-wrap">
                <table className="schedule-table">
                  <thead>
                    <tr><th>YEAR</th><th>INVESTED</th><th>VALUE</th><th>GAINS</th></tr>
                  </thead>
                  <tbody>
                    {projection.yearly.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{inr(row.invested)}</td>
                        <td>{inr(row.value)}</td>
                        <td>{inr(row.gains)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'stepup' && (
            <div className="panel-grid">
              <div>
                <RangeField
                  label="Increase the SIP every year by"
                  value={stepUp}
                  min={0}
                  max={25}
                  step={1}
                  onChange={setStepUp}
                  display={stepUp ? `+${stepUp}% a year` : 'No step-up'}
                  chips={STEP_CHIPS}
                  footLeft="0%"
                  footRight="25%"
                />
                <p className="panel-note">
                  A step-up raises your contribution each year, usually with your
                  salary. Your final-year monthly investment would be{' '}
                  <strong>{inr(monthlyAtEnd)}</strong>.
                </p>
              </div>
              <div>
                {stepUp === 0 ? (
                  <p className="panel-note">
                    Move the slider to see how much extra a yearly increase adds.
                  </p>
                ) : (
                  <div className="stat-grid">
                    <Stat label="Value with step-up" value={inr(projection.value)} tone="good" />
                    <Stat label="Value without step-up" value={inr(withoutStepUp.value)} />
                    <Stat label="Extra corpus" value={inr(extraFromStepUp)} tone="good" />
                    <Stat label="Extra invested" value={inr(projection.invested - withoutStepUp.invested)} />
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'goal' && (
            <div className="panel-grid">
              <div>
                <MoneyField
                  id="sip-target"
                  label="Target amount"
                  value={target}
                  onChange={setTarget}
                  max={1000000000}
                  chips={[2500000, 5000000, 10000000, 50000000].map((v) => ({ label: compact(v), value: v }))}
                />
                <p className="panel-note">
                  Keep the return and years above. We work out the monthly amount
                  needed to reach this target.
                </p>
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label={`Monthly SIP for ${compact(target)}`} value={inr(needed)} tone="good" />
                  <Stat label="You are currently investing" value={inr(monthly)} />
                  <Stat
                    label={needed <= monthly ? 'You are on track' : 'Monthly shortfall'}
                    value={needed <= monthly ? 'Yes' : inr(needed - monthly)}
                    tone={needed <= monthly ? 'good' : 'bad'}
                  />
                  <Stat label="Projected value today" value={inr(projection.value)} />
                </div>
                <p className="panel-note">
                  {needed <= monthly
                    ? `At ${inr(monthly)} a month you would exceed the target by ${inr(
                        projection.value - target
                      )}.`
                    : `Bump the SIP by ${inr(needed - monthly)} a month, or add more years.`}
                </p>
              </div>
            </div>
          )}

          {tab === 'inflation' && (
            <div className="panel-grid">
              <div>
                <RangeField
                  label="Expected inflation"
                  value={inflation}
                  min={0}
                  max={12}
                  step={0.5}
                  onChange={setInflation}
                  display={pct(inflation, 1)}
                  chips={INFLATION_CHIPS}
                  footLeft="0%"
                  footRight="12%"
                />
                <p className="panel-note">
                  ₹1 today buys less in {years} years. This shows what your corpus
                  is worth in today's prices, so the number stays honest.
                </p>
              </div>
              <div>
                <div className="stat-grid">
                  <Stat label="Future value" value={inr(projection.value)} />
                  <Stat label="In today's money" value={inr(todayValue)} tone="good" />
                  <Stat label="Lost to inflation" value={inr(projection.value - todayValue)} tone="bad" />
                  <Stat label="Purchasing power" value={projection.value > 0 ? `${+((todayValue / projection.value) * 100).toFixed(0)}%` : '—'} />
                </div>
                <p className="panel-note">
                  So {inr(projection.value)} will feel like {inr(todayValue)} does
                  today. If you want more buying power than that, raise the target
                  in the goal tab.
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

export default SipCalculator;
