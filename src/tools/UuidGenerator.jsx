import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const UuidGenerator = () => {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState([crypto.randomUUID()]);
  const [uppercase, setUppercase] = useState(false);
  const [dashless, setDashless] = useState(false);

  const generate = () => {
    const list = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (dashless) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  };

  return (
    <ToolLayout title="UUID Generator" description="Generate UUID v4 identifiers in bulk, with uppercase and dashless options.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Quantity</label>
              <input className="tool-input" type="number" min="1" max="100" value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
            </div>
          </div>
          <div className="control-row toggle-row">
            <label className="toggle">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase
            </label>
            <label className="toggle">
              <input type="checkbox" checked={dashless} onChange={(e) => setDashless(e.target.checked)} /> Dashless
            </label>
          </div>
          <button className="tool-btn tool-btn-primary" onClick={generate}>Generate UUIDs</button>
        </div>
        <div className="uuid-list">
          {uuids.map((id, i) => (
            <div key={i} className="uuid-item">
              <span className="uuid-index">#{i + 1}</span>
              <span className="uuid-value">{id}</span>
              <CopyButton text={id} className="uuid-copy" />
            </div>
          ))}
          {uuids.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Generate to see UUIDs here.</p>}
        </div>
      </div>
    </ToolLayout>
  );
};

export default UuidGenerator;
