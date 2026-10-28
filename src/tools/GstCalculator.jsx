import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const fmt = (n) =>
  isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 2, style: 'currency', currency: 'INR' }) : '—';

const GstCalculator = () => {
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('18');
  const [customRate, setCustomRate] = useState('1.5');
  const [mode, setMode] = useState('add'); // 'add' | 'extract'

  const r = rate === 'custom' ? parseFloat(customRate) || 0 : parseFloat(rate) || 0;
  const a = parseFloat(amount) || 0;

  let base, gst, total;
  if (mode === 'add') {
    base = a;
    gst = (base * r) / 100;
    total = base + gst;
  } else {
    total = a;
    base = total / (1 + r / 100);
    gst = total - base;
  }
  const half = gst / 2;

  return (
    <ToolLayout title="GST Calculator" description="Add or remove GST from any amount with Indian GST rates (5%, 12%, 18%, 28%).">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Amount (₹)</label>
              <input className="tool-input" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="control-group">
              <label className="tool-label">GST rate</label>
              <select className="tool-input" value={rate} onChange={(e) => setRate(e.target.value)}>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
                <option value="custom">Custom…</option>
              </select>
            </div>
            {rate === 'custom' && (
              <div className="control-group">
                <label className="tool-label">Custom rate (%)</label>
                <input className="tool-input" type="number" min="0" step="0.1" value={customRate} onChange={(e) => setCustomRate(e.target.value)} />
              </div>
            )}
          </div>
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Calculation</label>
              <select className="tool-input" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="add">Add GST to amount</option>
                <option value="extract">Extract GST from total</option>
              </select>
            </div>
          </div>
        </div>

        <div className="control-row stats-row">
          <div className="stat-card"><div className="stat-value">{fmt(base)}</div><div className="stat-label">Base amount</div></div>
          <div className="stat-card"><div className="stat-value">{fmt(gst)}</div><div className="stat-label">GST ({r}%)</div></div>
          <div className="stat-card"><div className="stat-value">{fmt(total)}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-value">{fmt(half)}</div><div className="stat-label">CGST</div></div>
          <div className="stat-card"><div className="stat-value">{fmt(half)}</div><div className="stat-label">SGST</div></div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default GstCalculator;
