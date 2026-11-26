import { useEffect, useState } from 'react';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const Stat = ({ label, value, tone = '' }) => (
  <div className={`stat ${tone}`}>
    <b>{value}</b>
    <span>{label}</span>
  </div>
);

/** Typed money / percentage input with optional quick chips. */
export function MoneyField({
  id, label, value, onChange, prefix = '₹', suffix, chips, help, placeholder, max = 1e9
}) {
  const format = (v) =>
    v || v === 0 ? Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '';
  const [text, setText] = useState(() => format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused]);

  const handle = (event) => {
    const raw = event.target.value;
    setText(raw);
    const parsed = Number(raw.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsed)) onChange(clamp(parsed, 0, max));
  };

  return (
    <div className="cal-field">
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
          onChange={handle}
          onBlur={() => setFocused(false)}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
      {chips?.length > 0 && (
        <div className="quick-chips">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={`quick-chip ${Math.abs(chip.value - value) < 0.001 ? 'on' : ''}`}
              onClick={() => onChange(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

/** Labelled slider with a live value and optional chips. */
export function RangeField({
  label, value, min, max, step, onChange, display, chips, footLeft, footRight
}) {
  return (
    <div className="slider-block">
      <div className="field-head">
        <span className="field-label">{label}</span>
        <b className="slider-value">{display}</b>
      </div>
      <input
        className="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        style={{ '--fill': `${((clamp(value, min, max) - min) / (max - min)) * 100}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      {(footLeft || footRight) && (
        <div className="range-meta"><span>{footLeft}</span><span>{footRight}</span></div>
      )}
      {chips?.length > 0 && (
        <div className="quick-chips">
          {chips.map((chip) => (
            <button
              key={chip.value}
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

export function Toggle({ id, label, checked, onChange }) {
  return (
    <label className="check-row" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/** Pill tabs with a coloured dot, matching the EMI calculator's deep-dive tabs. */
export function TabsBar({ tabs, value, onChange, label = 'Details' }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={value === item.key}
          className={`tab ${value === item.key ? 'on' : ''}`}
          onClick={() => onChange(item.key)}
        >
          {item.color && <i style={{ background: item.color }} aria-hidden="true" />}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export const EmptyPanel = ({ children }) => <p className="panel-note">{children}</p>;

/** Simple two-way segmented control. */
export function Segmented({ options, value, onChange, className = '', label }) {
  return (
    <div className={`segment ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`seg-btn ${value === option.value ? 'on' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
