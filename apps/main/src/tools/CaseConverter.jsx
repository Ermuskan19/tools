import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const CASES = [
  { key: 'upper', label: 'UPPER CASE', fn: (s) => s.toUpperCase() },
  { key: 'lower', label: 'lower case', fn: (s) => s.toLowerCase() },
  { key: 'title', label: 'Title Case', fn: (s) => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) },
  { key: 'camel', label: 'camelCase', fn: (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^\w/, c => c.toLowerCase()) },
  { key: 'snake', label: 'snake_case', fn: (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase().replace(/^_+|_+$/g, '') },
  { key: 'kebab', label: 'kebab-case', fn: (s) => s.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-+|-+$/g, '') },
  { key: 'constant', label: 'CONSTANT_CASE', fn: (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase().replace(/^_+|_+$/g, '') },
  { key: 'alternating', label: 'aLtErNaTiNg', fn: (s) => s.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('') }
];

const CaseConverter = () => {
  const [input, setInput] = useState('');

  const results = useMemo(
    () => CASES.map(c => ({ key: c.key, label: c.label, value: c.fn(input) })),
    [input]
  );

  return (
    <ToolLayout title="Case Converter" description="Convert text between UPPER, lower, Title, camelCase, snake_case, kebab-case, and more instantly.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Enter text</label>
          <textarea className="tool-textarea" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Type text to convert..." />
        </div>
        <div className="case-grid">
          {results.map((r) => (
            <div key={r.key} className="case-card">
              <div className="case-header">
                <span className="case-name">{r.label}</span>
                <CopyButton text={r.value} className="case-copy" />
              </div>
              <div className="case-value">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CaseConverter;
