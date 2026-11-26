import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const inr = (n) =>
  isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 0, style: 'currency', currency: 'INR' }) : '—';

const EmiCalculator = () => {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');
  const [unit, setUnit] = useState('years'); // 'years' | 'months'

  const P = parseFloat(principal) || 0;
  const annual = parseFloat(rate) || 0;
  const n = unit === 'years' ? (parseFloat(tenure) || 0) * 12 : parseFloat(tenure) || 0;
  const r = annual / 12 / 100;

  const emi = r > 0 && n > 0
    ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : n > 0 ? P / n : 0;
  const totalPayable = emi * n;
  const interest = totalPayable - P;

  return (
    <ToolLayout title="EMI Calculator" description="Calculate loan EMI, total interest, and total payable for home, car, and personal loans.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Loan amount (₹)</label>
              <input className="tool-input" type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
            </div>
            <div className="control-group">
              <label className="tool-label">Interest rate (% p.a.)</label>
              <input className="tool-input" type="number" min="0" step="0.05" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="control-group">
              <label className="tool-label">Tenure</label>
              <input className="tool-input" type="number" min="1" value={tenure} onChange={(e) => setTenure(e.target.value)} />
            </div>
            <div className="control-group">
              <label className="tool-label">Unit</label>
              <select className="tool-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>

        <div className="control-row stats-row">
          <div className="stat-card"><div className="stat-value">{inr(emi)}</div><div className="stat-label">Monthly EMI</div></div>
          <div className="stat-card"><div className="stat-value">{inr(interest)}</div><div className="stat-label">Total interest</div></div>
          <div className="stat-card"><div className="stat-value">{inr(totalPayable)}</div><div className="stat-label">Total payable</div></div>
          <div className="stat-card"><div className="stat-value">{n || 0}</div><div className="stat-label">Payments</div></div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EmiCalculator;
