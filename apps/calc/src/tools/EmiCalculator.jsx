import { useEffect, useMemo, useRef, useState } from 'react';
import {
  inr,
  compact,
  duration,
  emiFor,
  schedule,
  monthsFor,
  debtFreeLabel,
  computeLoan,
  effectiveRate,
  verdictFor,
  firstYearSplit
} from './emi';
import { downloadEmiPdf } from './reportPdf';

const LOAN_TYPES = [
  {
    key: 'home', label: 'Home', icon: '🏠', amount: 2500000, rate: 8.5, months: 240, emi: 50000,
    amountChips: [1000000, 2500000, 5000000, 10000000], yearChips: [10, 15, 20, 30]
  },
  {
    key: 'car', label: 'Car', icon: '🚗', amount: 800000, rate: 9.2, months: 60, emi: 20000,
    amountChips: [500000, 800000, 1200000, 2000000], yearChips: [3, 5, 7]
  },
  {
    key: 'personal', label: 'Personal', icon: '👤', amount: 300000, rate: 12.5, months: 36, emi: 12000,
    amountChips: [100000, 300000, 500000, 1000000], yearChips: [1, 3, 5]
  },
  {
    key: 'education', label: 'Education', icon: '🎓', amount: 1000000, rate: 9.5, months: 84, emi: 20000,
    amountChips: [500000, 1000000, 2000000, 4000000], yearChips: [3, 5, 7, 10]
  }
];

const MODES = [
  { key: 'emi', label: 'Find my EMI' },
  { key: 'borrow', label: 'How much can I borrow?' },
  { key: 'time', label: 'How long will it take?' }
];

const MODE_HELP = {
  emi: 'Tell us the loan. We show the monthly EMI.',
  borrow: 'Tell us the EMI you are comfortable with. We show how much you can borrow.',
  time: 'Tell us the loan and the EMI you want to pay. We show how long it will take.'
};

const FIELDS = {
  amount: { label: 'Loan amount', prefix: '₹', min: 50000, max: 50000000, step: 50000, hardMax: 1000000000 },
  rate: { label: 'Interest rate (per year)', suffix: '%', min: 5, max: 30, step: 0.05, hardMax: 40 },
  months: { label: 'Loan period', min: 6, max: 360, step: 1, hardMax: 480 },
  emi: { label: 'Monthly EMI', prefix: '₹', min: 1000, max: 500000, step: 500, hardMax: 100000000 }
};

const DEFAULTS = {
  type: 'home',
  mode: 'emi',
  amount: 2500000,
  rate: 8.5,
  months: 240,
  emi: 50000,
  unit: 'y'
};

const TAX_LIMITS = { homeInterest: 200000, homePrincipal: 150000, cess: 1.04 };

const TABS = [
  { key: 'safety', label: 'Safety check', color: '#15803d' },
  { key: 'faster', label: 'Pay it off faster', color: '#0f766e' },
  { key: 'rate', label: 'If rates change', color: '#d97706' },
  { key: 'cost', label: 'True cost', color: '#2563eb' },
  { key: 'tax', label: 'Tax saving', color: '#7c3aed' },
  { key: 'compare', label: 'Compare two offers', color: '#db2777' },
  { key: 'schedule', label: 'Schedule', color: '#64748b' }
];

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const fmtMoney = (v) => Math.round(v).toLocaleString('en-IN');
const fmtRate = (v) => `${+v.toFixed(2)}`;
const fmtMonths = (v, unit) => (unit === 'y' ? `${+(v / 12).toFixed(2)}` : `${Math.round(v)}`);

const formatValue = (key, value, unit) => {
  if (key === 'amount' || key === 'emi') return fmtMoney(value);
  if (key === 'rate') return fmtRate(value);
  return fmtMonths(value, unit);
};

const parseValue = (key, raw, unit, hardMax) => {
  const parsed = Number(String(raw).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  let value = parsed;
  if (key === 'months') value = unit === 'y' ? Math.round(parsed * 12) : Math.round(parsed);
  if (key === 'rate') value = Math.round(parsed * 100) / 100;
  return Math.min(hardMax, value);
};

const labelFor = (key, mode) => {
  if (key === 'emi') {
    return mode === 'borrow' ? 'EMI you can pay each month' : 'EMI you want to pay';
  }
  return FIELDS[key].label;
};

const chipsFor = (key, loanType) => {
  if (key === 'amount') {
    return loanType.amountChips.map((v) => ({ label: compact(v), value: v }));
  }
  if (key === 'rate') {
    return [7.5, 8.5, 9.5, 10.5, 12, 14].map((v) => ({ label: `${v}%`, value: v }));
  }
  if (key === 'months') {
    return loanType.yearChips.map((y) => ({ label: `${y} ${y === 1 ? 'yr' : 'yrs'}`, value: y * 12 }));
  }
  return [10000, 20000, 50000, 100000].map((v) => ({ label: compact(v), value: v }));
};

const rangeText = (key) => {
  if (key === 'amount') return ['₹50K', '₹5 Cr'];
  if (key === 'rate') return ['5%', '30%'];
  if (key === 'months') return ['6 mo', '30 yrs'];
  return ['₹1K', '₹5 L'];
};

function useAnimatedNumber(target) {
  const [display, setDisplay] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    const from = previous.current;
    previous.current = target;
    if (!Number.isFinite(target) || from === target) {
      setDisplay(target);
      return undefined;
    }
    if (typeof window === 'undefined') return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(target);
      return undefined;
    }
    const started = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 400);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return display;
}

function NumberField({
  fieldKey, label, value, onChange, unit, onUnitChange, chips, min, max, step, hardMax, prefix, suffix
}) {
  const [text, setText] = useState(() => formatValue(fieldKey, value, unit));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatValue(fieldKey, value, unit));
  }, [fieldKey, value, unit, focused]);

  const handleText = (event) => {
    const raw = event.target.value;
    setText(raw);
    const parsed = parseValue(fieldKey, raw, unit, hardMax);
    if (parsed !== null && parsed > 0) onChange(parsed);
  };

  const percent = clamp(((value - min) / (max - min)) * 100, 0, 100);

  return (
    <div className="cal-field">
      <div className="field-head">
        <label className="field-label" htmlFor={`f-${fieldKey}`}>{label}</label>
        <div className="number-box">
          {prefix && <span className="affix">{prefix}</span>}
          <input
            id={`f-${fieldKey}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            onFocus={() => setFocused(true)}
            onChange={handleText}
            onBlur={() => { setFocused(false); setText(formatValue(fieldKey, value, unit)); }}
            aria-label={label}
          />
          {suffix && <span className="affix">{suffix}</span>}
          {fieldKey === 'months' && (
            <select
              className="unit-select"
              value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              aria-label="Loan period unit"
            >
              <option value="y">years</option>
              <option value="m">months</option>
            </select>
          )}
        </div>
      </div>
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        style={{ '--fill': `${percent}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
      />
      <div className="range-meta">
        <span>{rangeText(fieldKey)[0]}</span>
        <span>{rangeText(fieldKey)[1]}</span>
      </div>
      {chips.length > 0 && (
        <div className="quick-chips">
          {chips.map((chip) => (
            <button
              key={`${fieldKey}-${chip.value}`}
              type="button"
              className={`quick-chip ${Math.abs(chip.value - value) < 0.001 ? 'on' : ''}`}
              onClick={() => onChange(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberInput({ id, label, value, onChange, prefix, suffix, placeholder }) {
  const [text, setText] = useState(() => (value ? Math.round(value).toLocaleString('en-IN') : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value ? Math.round(value).toLocaleString('en-IN') : '');
  }, [value, focused]);

  const handleChange = (event) => {
    const raw = event.target.value;
    setText(raw);
    const parsed = Number(raw.replace(/[^0-9.]/g, ''));
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  return (
    <div className="cal-field compact">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="number-box wide">
        {prefix && <span className="affix">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          onFocus={() => setFocused(true)}
          onChange={handleChange}
          onBlur={() => setFocused(false)}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
    </div>
  );
}

const PanelEmpty = ({ children }) => <p className="panel-note">{children}</p>;

const Tile = ({ label, value, tone = '' }) => (
  <div className={`stat ${tone}`}>
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

function SafetyPanel({ result, income, setIncome, otherEmis, setOtherEmis, verdict }) {
  const comfortableEmi = income > 0 ? Math.max(0, income * 0.35 - otherEmis) : 0;
  const loanThatFits = result.emi > 0 ? result.amount * (comfortableEmi / result.emi) : 0;

  return (
    <div className="panel-grid">
      <div>
        <NumberInput
          id="safety-income"
          label="Monthly take-home income"
          value={income}
          onChange={setIncome}
          prefix="₹"
          placeholder="e.g. 80,000"
        />
        <div className="quick-chips">
          {[50000, 80000, 150000].map((v) => (
            <button
              key={v}
              type="button"
              className={`quick-chip ${income === v ? 'on' : ''}`}
              onClick={() => setIncome(v)}
            >
              {compact(v)}
            </button>
          ))}
        </div>
        <NumberInput
          id="safety-other"
          label="Other EMIs you pay each month (optional)"
          value={otherEmis}
          onChange={setOtherEmis}
          prefix="₹"
          placeholder="0"
        />
      </div>
      <div>
        {!income ? (
          <PanelEmpty>
            Enter your income to see how this EMI sits in your budget. Nothing
            leaves your device.
          </PanelEmpty>
        ) : (
          <>
            <div className="verdict-line">
              <span className={`tag ${verdict?.tone || 'good'}`}>{verdict?.label}</span>
              <b>{verdict ? verdict.ratio.toFixed(1) : '0'}%</b>
              <span className="muted">of income goes to EMIs</span>
            </div>
            <div className="score">
              <span className="score-good" />
              <span className="score-warn" />
              <span className="score-bad" />
              <span
                className="score-marker"
                style={{ left: `${clamp(((verdict?.ratio || 0) / 70) * 100, 0, 99)}%` }}
                data-value={`${Math.round(verdict?.ratio || 0)}%`}
              />
            </div>
            <div className="score-labels">
              <span>0%</span><span>35%</span><span>50%</span><span>70%+</span>
            </div>
            <div className="stat-grid">
              <Tile label="Comfortable EMI for you" value={inr(comfortableEmi)} tone="good" />
              <Tile label="Loan that fits at this rate and period" value={compact(loanThatFits)} />
            </div>
            <p className="panel-note">
              Many lenders look at 40–50% of income. Staying under 35% leaves
              room for everything else.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function FasterPanel({ result, extra, setExtra, lump, setLump }) {
  const improved = schedule(result.amount, result.rate, result.emi, extra, lump);
  const active = extra > 0 || lump > 0;
  const maxLump = Math.min(Math.round(result.amount), 5000000);

  return (
    <div className="panel-grid">
      <div>
        <div className="slider-block">
          <div className="field-head">
            <span className="field-label">Extra every month</span>
            <b className="slider-value">{inr(extra)}</b>
          </div>
          <input
            className="range"
            type="range"
            min={0}
            max={50000}
            step={500}
            value={extra}
            style={{ '--fill': `${(extra / 50000) * 100}%` }}
            onChange={(e) => setExtra(Number(e.target.value))}
            aria-label="Extra amount every month"
          />
          <div className="quick-chips">
            {[2000, 5000, 10000].map((v) => (
              <button key={v} type="button" className={`quick-chip ${extra === v ? 'on' : ''}`} onClick={() => setExtra(v)}>
                {compact(v)}
              </button>
            ))}
          </div>
        </div>
        <div className="slider-block">
          <div className="field-head">
            <span className="field-label">One-time prepayment</span>
            <b className="slider-value">{inr(lump)}</b>
          </div>
          <input
            className="range"
            type="range"
            min={0}
            max={Math.max(0, maxLump)}
            step={10000}
            value={clamp(lump, 0, maxLump)}
            style={{ '--fill': `${maxLump ? (lump / maxLump) * 100 : 0}%` }}
            onChange={(e) => setLump(Number(e.target.value))}
            aria-label="One-time prepayment"
          />
        </div>
        <p className="panel-note">
          A small extra amount early on cuts the most interest.
        </p>
      </div>
      <div>
        {!active || !improved ? (
          <PanelEmpty>Move a slider to see how much interest and time you save.</PanelEmpty>
        ) : (
          <div className="stat-grid">
            <Tile label="Interest saved" value={inr(result.schedule.totalInterest - improved.totalInterest)} tone="good" />
            <Tile label="Time saved" value={duration(result.schedule.months - improved.months)} tone="good" />
            <Tile label="New debt-free date" value={debtFreeLabel(improved.months)} />
            <Tile label="New loan period" value={duration(improved.months)} />
          </div>
        )}
      </div>
    </div>
  );
}

function RatePanel({ result, delta, setDelta }) {
  const newRate = Math.max(0, result.rate + delta);
  const newEmi = emiFor(result.amount, newRate, result.months);
  const newSchedule = schedule(result.amount, newRate, newEmi);
  const monthsSameEmi = monthsFor(result.amount, newRate, result.emi);
  const interestDelta = newSchedule ? newSchedule.totalInterest - result.schedule.totalInterest : 0;

  return (
    <div className="panel-grid">
      <div>
        <div className="slider-block">
          <div className="field-head">
            <span className="field-label">If your rate changes by</span>
            <b className="slider-value">{delta > 0 ? '+' : ''}{delta}%</b>
          </div>
          <input
            className="range"
            type="range"
            min={-2}
            max={4}
            step={0.25}
            value={delta}
            style={{ '--fill': `${((delta + 2) / 6) * 100}%` }}
            onChange={(e) => setDelta(Number(e.target.value))}
            aria-label="Rate change"
          />
          <div className="quick-chips">
            {[-0.5, 0.5, 1, 2].map((v) => (
              <button key={v} type="button" className={`quick-chip ${delta === v ? 'on' : ''}`} onClick={() => setDelta(v)}>
                {v > 0 ? '+' : ''}{v}%
              </button>
            ))}
          </div>
        </div>
        <p className="panel-note">
          Useful for floating-rate loans, where the lender can change the rate
          during the term.
        </p>
      </div>
      <div>
        <div className="stat-grid">
          <Tile label="New rate" value={`${newRate.toFixed(2)}%`} />
          <Tile
            label="New EMI"
            value={`${inr(newEmi)} (${newEmi >= result.emi ? '+' : '−'}${inr(Math.abs(newEmi - result.emi))})`}
            tone={newEmi > result.emi ? 'bad' : 'good'}
          />
          <Tile
            label="Interest over the loan"
            value={`${interestDelta >= 0 ? '+' : '−'}${inr(Math.abs(interestDelta))}`}
            tone={interestDelta > 0 ? 'bad' : 'good'}
          />
          <Tile
            label={`Period if EMI stays ${inr(result.emi)}`}
            value={monthsSameEmi ? duration(monthsSameEmi) : 'Never ends'}
          />
        </div>
      </div>
    </div>
  );
}

function CostPanel({ result, feePct, setFeePct, gst, setGst, otherCharges, setOtherCharges }) {
  const fee = (result.amount * feePct) / 100 * (gst ? 1.18 : 1);
  const upfront = fee + otherCharges;
  const net = result.amount - upfront;
  const effective = effectiveRate(net, result.emi, result.months);

  return (
    <div className="panel-grid">
      <div>
        <NumberInput
          id="cost-fee"
          label="Processing fee"
          value={feePct}
          onChange={(v) => setFeePct(Math.min(v, 10))}
          suffix="%"
        />
        <label className="check-row" htmlFor="cost-gst">
          <input id="cost-gst" type="checkbox" checked={gst} onChange={(e) => setGst(e.target.checked)} />
          <span>Add 18% GST on the processing fee</span>
        </label>
        <NumberInput
          id="cost-other"
          label="Other one-time charges (insurance, legal)"
          value={otherCharges}
          onChange={setOtherCharges}
          prefix="₹"
          placeholder="0"
        />
      </div>
      <div>
        <div className="stat-grid">
          <Tile label="Rate on the offer" value={`${result.rate.toFixed(2)}%`} />
          <Tile
            label="What it really costs"
            value={effective ? `${effective.toFixed(2)}%` : '—'}
            tone={upfront > 0 ? 'bad' : 'good'}
          />
          <Tile label="Charges paid upfront" value={inr(upfront)} />
          <Tile label="Money you actually receive" value={inr(net)} />
          <Tile label="Total cost (interest + charges)" value={inr(result.totalInterest + upfront)} tone="bad" />
        </div>
        <p className="panel-note">
          Charges reduce what you receive but not what you repay, so the real
          rate is higher than the one on the offer.
        </p>
      </div>
    </div>
  );
}

function TaxPanel({ result, loanType, slab, setSlab }) {
  if (loanType !== 'home' && loanType !== 'education') {
    return (
      <PanelEmpty>
        Tax benefits on EMI apply to home and education loans. Switch the loan
        type to Home or Education above to see them.
      </PanelEmpty>
    );
  }

  const isHome = loanType === 'home';
  const firstYear = firstYearSplit(result.schedule);
  const interestUsed = isHome ? Math.min(firstYear.interest, TAX_LIMITS.homeInterest) : firstYear.interest;
  const principalUsed = isHome ? Math.min(firstYear.principal, TAX_LIMITS.homePrincipal) : 0;
  const saving = (interestUsed + principalUsed) * (slab / 100) * TAX_LIMITS.cess;

  return (
    <div className="panel-grid">
      <div>
        <span className="field-label">Your tax slab (old regime)</span>
        <div className="segment small" style={{ marginTop: 8 }}>
          {[5, 20, 30].map((value) => (
            <button
              key={value}
              type="button"
              className={`seg-btn ${slab === value ? 'on' : ''}`}
              onClick={() => setSlab(value)}
            >
              {value}%
            </button>
          ))}
        </div>
        <p className="panel-note">
          {isHome
            ? 'Home loan, self-occupied. Interest is capped at ₹2,00,000 and principal at ₹1,50,000 a year. The ₹1.5 lakh limit is shared with your other 80C savings.'
            : 'Education loan interest can be claimed under Section 80E with no cap, for up to 8 years.'}
          {' '}Not available in the new regime.
        </p>
      </div>
      <div>
        <div className="stat-grid">
          <Tile label="Interest in year 1" value={inr(firstYear.interest)} />
          {isHome && <Tile label="Principal in year 1" value={inr(firstYear.principal)} />}
          <Tile label="Estimated tax saved in year 1" value={inr(saving)} tone="good" />
          <Tile label="EMI after tax saving, per month" value={inr(result.emi - saving / 12)} tone="good" />
        </div>
        <p className="panel-note">
          An estimate for planning. Your real saving depends on your full tax return.
        </p>
      </div>
    </div>
  );
}

function ComparePanel({ result, offerA, setOfferA, offerB, setOfferB }) {
  const quote = (offer) => {
    const emi = emiFor(result.amount, offer.rate, result.months);
    const s = schedule(result.amount, offer.rate, emi);
    const interest = s ? s.totalInterest : 0;
    const fee = (result.amount * offer.fee) / 100 * 1.18;
    return { emi, interest, fee, total: interest + fee };
  };

  const a = quote(offerA);
  const b = quote(offerB);
  const difference = a.total - b.total;

  return (
    <div className="panel-grid">
      <div>
        <div className="offer-grid">
          <div className="offer">
            <b>Offer A</b>
            <NumberInput id="offer-a-rate" label="Interest rate" value={offerA.rate} onChange={(v) => setOfferA({ ...offerA, rate: v })} suffix="%" />
            <NumberInput id="offer-a-fee" label="Processing fee" value={offerA.fee} onChange={(v) => setOfferA({ ...offerA, fee: v })} suffix="%" />
          </div>
          <div className="offer">
            <b>Offer B</b>
            <NumberInput id="offer-b-rate" label="Interest rate" value={offerB.rate} onChange={(v) => setOfferB({ ...offerB, rate: v })} suffix="%" />
            <NumberInput id="offer-b-fee" label="Processing fee" value={offerB.fee} onChange={(v) => setOfferB({ ...offerB, fee: v })} suffix="%" />
          </div>
        </div>
        <p className="panel-note">Same amount and period for both offers. Fees include 18% GST.</p>
      </div>
      <div>
        <div className="stat-grid">
          <Tile label="A: EMI" value={inr(a.emi)} />
          <Tile label="A: total cost" value={inr(a.total)} />
          <Tile label="B: EMI" value={inr(b.emi)} />
          <Tile label="B: total cost" value={inr(b.total)} />
        </div>
        <p className="verdict-text">
          {Math.abs(difference) < 1
            ? 'Both offers cost the same.'
            : `${difference > 0 ? 'Offer B' : 'Offer A'} costs ${inr(Math.abs(difference))} less overall, fees included.`}
        </p>
      </div>
    </div>
  );
}

function SchedulePanel({ result, view, setView, monthlyRows, setMonthlyRows }) {
  const { years, rows } = result.schedule;
  const yearMax = years.reduce((max, y) => Math.max(max, y.principal + y.interest), 0);

  return (
    <div>
      <div className="schedule-head">
        <div className="segment small">
          <button type="button" className={`seg-btn ${view === 'year' ? 'on' : ''}`} onClick={() => setView('year')}>Yearly</button>
          <button type="button" className={`seg-btn ${view === 'month' ? 'on' : ''}`} onClick={() => setView('month')}>Monthly</button>
        </div>
        <span className="legend">
          <span className="legend-dot principal" /> Principal
          <span className="legend-dot interest" /> Interest
        </span>
      </div>

      <div className="year-chart" role="img" aria-label="Principal and interest paid each year">
        {years.map((year, index) => {
          const total = year.principal + year.interest;
          const principalHeight = yearMax ? (year.principal / yearMax) * 100 : 0;
          const interestHeight = yearMax ? (year.interest / yearMax) * 100 : 0;
          return (
            <div
              className="year-bar"
              key={index}
              title={`Year ${index + 1}: principal ${inr(year.principal)}, interest ${inr(year.interest)}`}
            >
              <div className="year-stack" style={{ height: `${Math.max((total / (yearMax || 1)) * 100, 2)}%` }}>
                <span className="bar-interest" style={{ flex: interestHeight || 0 }} />
                <span className="bar-principal" style={{ flex: principalHeight || 0 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-caption">
        <span>Year 1</span>
        <span>Year {years.length}</span>
      </div>

      <div className="table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>{view === 'year' ? 'YEAR' : 'MONTH'}</th>
              <th>PRINCIPAL</th>
              <th>INTEREST</th>
              <th>BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {(view === 'year'
              ? years.map((year, index) => ({ key: index, principal: year.principal, interest: year.interest, balance: year.balance }))
              : rows.slice(0, monthlyRows).map((row, index) => ({ key: index, ...row }))
            ).map((row) => (
              <tr key={row.key}>
                <td>{row.key + 1}</td>
                <td>{inr(row.principal)}</td>
                <td>{inr(row.interest)}</td>
                <td>{inr(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view === 'month' && monthlyRows < rows.length && (
        <button type="button" className="btn ghost small" style={{ marginTop: 12 }} onClick={() => setMonthlyRows(monthlyRows + 60)}>
          Show more
        </button>
      )}
    </div>
  );
}

export const EmiCalculator = ({ title = 'EMI Calculator', description = 'Work out your monthly EMI and check if you can really afford it.' }) => {
  const [typeKey, setTypeKey] = useState(DEFAULTS.type);
  const loanType = LOAN_TYPES.find((t) => t.key === typeKey) || LOAN_TYPES[0];
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [emi, setEmi] = useState(DEFAULTS.emi);
  const [unit, setUnit] = useState(DEFAULTS.unit);

  const [tab, setTab] = useState('safety');
  const [income, setIncome] = useState(0);
  const [otherEmis, setOtherEmis] = useState(0);
  const [extra, setExtra] = useState(0);
  const [lump, setLump] = useState(0);
  const [delta, setDelta] = useState(1);
  const [feePct, setFeePct] = useState(1);
  const [gst, setGst] = useState(true);
  const [otherCharges, setOtherCharges] = useState(0);
  const [slab, setSlab] = useState(30);
  const [offerA, setOfferA] = useState({ rate: 8.5, fee: 1 });
  const [offerB, setOfferB] = useState({ rate: 8.1, fee: 1.5 });
  const [scheduleView, setScheduleView] = useState('year');
  const [monthlyRows, setMonthlyRows] = useState(60);

  const [today, setToday] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const result = useMemo(
    () => computeLoan({ mode, amount, rate, months, emi }),
    [mode, amount, rate, months, emi]
  );

  const verdict = result.error ? null : verdictFor(result.emi, otherEmis, income);
  const animated = useAnimatedNumber(result.error ? 0 : result.emi);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  };

  useEffect(() => {
    setToday(new Date());
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  // Share links carry the loan, never the income. Applied after mount so the
  // prerendered HTML and the hydrated page start from the same values.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    const nextType = params.get('type');
    const nextMode = params.get('mode');
    const nextAmount = Number(params.get('amount'));
    const nextRate = Number(params.get('rate'));
    const nextMonths = Number(params.get('months'));
    const nextEmi = Number(params.get('emi'));
    if (LOAN_TYPES.some((t) => t.key === nextType)) setTypeKey(nextType);
    if (MODES.some((m) => m.key === nextMode)) setMode(nextMode);
    if (nextAmount > 0) setAmount(nextAmount);
    if (nextRate >= 0 && nextRate <= 40) setRate(nextRate);
    if (nextMonths > 0) setMonths(nextMonths);
    if (nextEmi > 0) setEmi(nextEmi);
  }, []);

  const selectType = (next) => {
    setTypeKey(next.key);
    setAmount(next.amount);
    setRate(next.rate);
    setMonths(next.months);
    setEmi(next.emi);
    setUnit('y');
  };

  // Carry the current numbers across when the user changes the question, so
  // the result never jumps for no reason.
  const selectMode = (next) => {
    if (!result.error && next !== mode) {
      if (next === 'time' || next === 'borrow') setEmi(Math.round(result.emi));
      if (next === 'emi' || next === 'time') setAmount(Math.round(result.amount));
      if (next === 'time' || next === 'borrow') setMonths(Math.round(result.months));
    }
    setMode(next);
  };

  const bigValue = (() => {
    if (result.error) return '—';
    if (mode === 'borrow') return inr(result.amount);
    if (mode === 'time') return duration(result.months);
    return inr(animated);
  })();

  const bigLabel = mode === 'borrow' ? 'You can borrow' : mode === 'time' ? 'Time to repay' : 'Monthly EMI';
  const principalShare = result.error ? 50 : (result.amount / result.totalPayable) * 100;

  const buildShareUrl = () => {
    const params = new URLSearchParams({
      type: typeKey,
      mode,
      amount: String(Math.round(amount)),
      rate: String(rate),
      months: String(Math.round(months)),
      emi: String(Math.round(emi))
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(message);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
        notify(message);
      } catch {
        notify('Press and hold to copy');
      }
      area.remove();
    }
  };

  const share = async () => {
    if (result.error) return notify('Fix the inputs first');
    const url = buildShareUrl();
    try {
      window.history.replaceState(null, '', url);
    } catch { /* ignore */ }
    await copyText(url, 'Link copied. It opens this exact calculation.');
  };

  const copySummary = async () => {
    if (result.error) return notify('Fix the inputs first');
    const summary = `EMI plan: Loan ${inr(result.amount)} at ${result.rate}% for ${duration(result.months)}. EMI ${inr(result.emi)}. Total interest ${inr(result.totalInterest)}. Debt-free by ${debtFreeLabel(result.months)}. Made with 3toOne Calc.`;
    await copyText(summary, 'Summary copied');
  };

  const downloadPdf = async () => {
    if (result.error) return notify('Fix the inputs first');
    try {
      await downloadEmiPdf({ result, loanType: loanType.label });
      notify('PDF downloaded');
    } catch {
      notify('Could not create the PDF. Try again.');
    }
  };

  const openSafety = () => {
    setTab('safety');
    document.getElementById('go-deeper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];
  const panelContent = result.error ? (
    <p className="panel-note">Fix the loan details above to see this.</p>
  ) : (
    <>
      {tab === 'safety' && (
        <SafetyPanel
          result={result}
          income={income}
          setIncome={setIncome}
          otherEmis={otherEmis}
          setOtherEmis={setOtherEmis}
          verdict={verdict}
        />
      )}
      {tab === 'faster' && (
        <FasterPanel result={result} extra={extra} setExtra={setExtra} lump={lump} setLump={setLump} />
      )}
      {tab === 'rate' && <RatePanel result={result} delta={delta} setDelta={setDelta} />}
      {tab === 'cost' && (
        <CostPanel
          result={result}
          feePct={feePct}
          setFeePct={setFeePct}
          gst={gst}
          setGst={setGst}
          otherCharges={otherCharges}
          setOtherCharges={setOtherCharges}
        />
      )}
      {tab === 'tax' && (
        <TaxPanel result={result} loanType={typeKey} slab={slab} setSlab={setSlab} />
      )}
      {tab === 'compare' && (
        <ComparePanel
          result={result}
          offerA={offerA}
          setOfferA={setOfferA}
          offerB={offerB}
          setOfferB={setOfferB}
        />
      )}
      {tab === 'schedule' && (
        <SchedulePanel
          result={result}
          view={scheduleView}
          setView={setScheduleView}
          monthlyRows={monthlyRows}
          setMonthlyRows={setMonthlyRows}
        />
      )}
    </>
  );

  return (
    <section className="calculator" aria-label={title}>
      <div className="calc-shell">
        <div className="panel input-panel">
          <div className="panel-title">
            <h2>Your loan</h2>
            <span className="live-pill">Live</span>
          </div>

          <div className="segment type-segment">
            {LOAN_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                className={`seg-btn ${typeKey === type.key ? 'on' : ''}`}
                onClick={() => selectType(type)}
              >
                <span aria-hidden="true">{type.icon}</span> {type.label}
              </button>
            ))}
          </div>

          <div className="segment mode-segment">
            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`seg-btn ${mode === item.key ? 'on' : ''}`}
                onClick={() => selectMode(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mode-help">{MODE_HELP[mode]}</p>

          {(mode === 'emi' ? ['amount', 'rate', 'months'] : mode === 'borrow' ? ['emi', 'rate', 'months'] : ['amount', 'rate', 'emi']).map((key) => (
            <NumberField
              key={`${key}-${typeKey}`}
              fieldKey={key}
              min={FIELDS[key].min}
              max={FIELDS[key].max}
              step={FIELDS[key].step}
              hardMax={FIELDS[key].hardMax}
              prefix={FIELDS[key].prefix}
              suffix={FIELDS[key].suffix}
              value={key === 'amount' ? amount : key === 'rate' ? rate : key === 'months' ? months : emi}
              onChange={key === 'amount' ? setAmount : key === 'rate' ? setRate : key === 'months' ? setMonths : setEmi}
              label={labelFor(key, mode)}
              unit={unit}
              onUnitChange={setUnit}
              chips={chipsFor(key, loanType)}
            />
          ))}
        </div>

        <div className={`panel result-panel ${result.error ? 'is-error' : ''}`}>
          <div className="panel-title">
            <h2>Your result</h2>
            <span className="live-pill">Live</span>
          </div>

          {result.error ? (
            <div className="error-box" role="alert">{result.error}</div>
          ) : (
            <>
              <div className="result-label">{bigLabel}</div>
              <div className="result-big">{bigValue}</div>

              <div className="split-bar" aria-hidden="true">
                <span className="split-principal" style={{ width: `${principalShare}%` }} />
                <span className="split-interest" style={{ width: `${100 - principalShare}%` }} />
              </div>
              <div className="legend-row">
                <span><b className="legend-dot principal" />Principal <strong>{inr(result.amount)}</strong></span>
                <span><b className="legend-dot interest" />Interest <strong>{inr(result.totalInterest)}</strong></span>
              </div>

              <div className="stat-grid dark">
                <Tile label="Monthly EMI" value={inr(result.emi)} />
                <Tile label="Total payable" value={inr(result.totalPayable)} />
                <Tile label="Total interest" value={inr(result.totalInterest)} />
                <Tile label="Debt-free by" value={today ? debtFreeLabel(result.months, today) : '—'} />
              </div>

              <button type="button" className={`safety-strip ${verdict ? verdict.tone : ''}`} onClick={openSafety}>
                {verdict
                  ? `${verdict.tone === 'good' ? '✓' : verdict.tone === 'warn' ? '⚠' : '✕'} ${verdict.label}: EMI is ${verdict.ratio.toFixed(0)}% of your income`
                  : 'Add your income to check if this EMI is safe →'}
              </button>

              <div className="result-actions">
                <button type="button" className="btn solid" onClick={share}>Share result</button>
                <button type="button" className="btn ghost-light" onClick={copySummary}>Copy summary</button>
                <button type="button" className="btn ghost-light" onClick={downloadPdf}>Download PDF</button>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="disclaimer">
        Results are estimates for planning. They are not financial, tax or legal advice.
      </p>

      <div className="deep-card" id="go-deeper">
        <div className="deep-head">
          <div>
            <h3>Go deeper, only if you want to</h3>
            <p>Everything below uses the loan you set above.</p>
          </div>
          <span className="deep-hint">All free</span>
        </div>

        <div className="tabs" role="tablist" aria-label="Loan details">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={`tab ${tab === item.key ? 'on' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <i style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="deep-body" role="tabpanel" aria-label={activeTab.label}>
          {panelContent}
        </div>
      </div>

      <div className={`toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </section>
  );
};

export default EmiCalculator;
