import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const GradientMaker = () => {
  const [stops, setStops] = useState([
    { id: '1', color: '#0ea5e9', position: 0 },
    { id: '2', color: '#38bdf8', position: 100 }
  ]);
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState('linear');

  const addStop = () => {
    const id = Date.now().toString();
    setStops((prev) => [...prev, { id, color: '#67e8f9', position: 50 }].sort((a, b) => a.position - b.position));
  };

  const removeStop = (id) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
    if (stops.length <= 2) setStops([{ id: '1', color: '#0ea5e9', position: 0 }, { id: '2', color: '#38bdf8', position: 100 }]);
  };

  const css = useMemo(() => {
    const stopList = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    if (type === 'radial') return `radial-gradient(${stopList})`;
    if (type === 'conic') return `conic-gradient(${stopList})`;
    return `linear-gradient(${angle}deg, ${stopList})`;
  }, [stops, angle, type]);

  return (
    <ToolLayout title="CSS Gradient Maker" description="Create beautiful CSS gradients visually and export code.">
      <div className="tool-two-pane">
        <div className="tool-panel input-pane">
          <div className="gradient-preview" style={{ background: css }} />
          <div className="control-group">
            <label className="tool-label">Type</label>
            <div className="unit-toggle">
              <button className={`unit-btn ${type === 'linear' ? 'active' : ''}`} onClick={() => setType('linear')}>Linear</button>
              <button className={`unit-btn ${type === 'radial' ? 'active' : ''}`} onClick={() => setType('radial')}>Radial</button>
              <button className={`unit-btn ${type === 'conic' ? 'active' : ''}`} onClick={() => setType('conic')}>Conic</button>
            </div>
          </div>
          {type === 'linear' && (
            <div className="control-group">
              <label className="tool-label">Angle</label>
              <input className="tool-input" type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
              <span className="control-value">{angle}°</span>
            </div>
          )}
          <div className="color-stops">
            {stops.map((s) => (
              <div key={s.id} className="color-stop">
                <input className="stop-color" type="color" value={s.color} onChange={(e) => setStops((prev) => prev.map((x) => (x.id === s.id ? { ...x, color: e.target.value } : x)))} />
                <input className="stop-pos" type="range" min="0" max="100" value={s.position} onChange={(e) => setStops((prev) => prev.map((x) => (x.id === s.id ? { ...x, position: Number(e.target.value) } : x)))} />
                <span className="stop-pos-val">{s.position}%</span>
                <button className="stop-remove" onClick={() => removeStop(s.id)}>×</button>
              </div>
            ))}
            <button className="tool-btn tool-btn-outline" onClick={addStop} style={{ marginTop: '0.5rem', width: 'fit-content' }}>Add color stop</button>
          </div>
        </div>

        <div className="tool-panel output-pane">
          <div className="tool-header-row">
            <label className="tool-label">CSS</label>
            <CopyButton text={css} />
          </div>
          <div className="code-block">{css}</div>
          <button className="tool-btn tool-btn-primary" onClick={() => navigator.clipboard.writeText(css)}>Copy CSS</button>
        </div>
      </div>
    </ToolLayout>
  );
};

export default GradientMaker;
