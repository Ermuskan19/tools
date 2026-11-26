import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const STYLES = {
  professional: (n, role, traits) => [
    `${n} — ${role}. ${traits.join(', ')}. Building things that ship.`,
    `${role} | ${traits[0] || 'Curious'} by nature, ${traits[1] || 'consistent'} by habit. — ${n}`,
    `${n}. ${role}. Focused on ${traits[0] || 'quality'} and ${traits[1] || 'growth'}.`
  ],
  witty: (n, role, traits) => [
    `${role} by day, ${traits[0] || 'overthinker'} by night. It is ${n}.`,
    `${n} — part ${role.toLowerCase()}, part ${traits[0] || 'chaos'}, all in.`,
    `Making peace with ${traits[1] || 'pixels'} one ${role.toLowerCase()} at a time. — ${n}`
  ],
  minimal: (n, role, traits) => [
    `${n}. ${role}.`,
    `${role} · ${traits[0] || 'learner'} · ${traits[1] || 'builder'}`,
    `${n} — ${role}, ${traits[0] || 'simpler'} every day.`
  ]
};

const BioGenerator = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [traits, setTraits] = useState('');
  const [style, setStyle] = useState('professional');

  const bios = useMemo(() => {
    if (!role.trim()) return [];
    const list = traits.split(',').map(t => t.trim()).filter(Boolean);
    const n = name.trim() || 'Hey, I am';
    return STYLES[style](n, role.trim(), list.length ? list : ['curious', 'driven']);
  }, [name, role, traits, style]);

  return (
    <ToolLayout title="Bio Generator" description="Write short, punchy bios for Instagram, LinkedIn, and portfolios in one click.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Name</label>
              <input className="tool-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Asha" />
            </div>
            <div className="control-group">
              <label className="tool-label">Role</label>
              <input className="tool-input" type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend Developer" />
            </div>
            <div className="control-group">
              <label className="tool-label">Style</label>
              <select className="tool-input" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Traits (comma separated)</label>
              <input className="tool-input" type="text" value={traits} onChange={(e) => setTraits(e.target.value)} placeholder="coffee lover, minimalist, writer" />
            </div>
          </div>
        </div>

        {bios.length > 0 && (
          <div className="result-list">
            <div className="tool-header-row">
              <label className="tool-label">{bios.length} bios</label>
              <CopyButton text={bios.join('\n')} />
            </div>
            {bios.map((b, i) => (
              <div key={i} className="result-row selectable">{b}</div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default BioGenerator;
