import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = LOWER.toUpperCase();
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);

  const generate = () => {
    let pool = '';
    if (useLower) pool += LOWER;
    if (useUpper) pool += UPPER;
    if (useNumbers) pool += NUMBERS;
    if (useSymbols) pool += SYMBOLS;
    if (!pool) pool = LOWER;

    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let result = '';
    for (let i = 0; i < length; i++) result += pool[bytes[i] % pool.length];
    setPassword(result);

    let s = 0;
    if (length >= 8) s += 1;
    if (length >= 12) s += 1;
    if (useUpper && useLower) s += 1;
    if (useNumbers) s += 1;
    if (useSymbols) s += 1;
    setStrength(s);
  };

  return (
    <ToolLayout title="Password Generator" description="Generate secure, random passwords with custom length and character types.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-group">
            <label className="tool-label">Length</label>
            <div className="control-row range-row">
              <input className="tool-input" type="range" min="4" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} />
              <span className="control-value">{length}</span>
            </div>
          </div>
          <div className="control-group toggles">
            <label className="tool-label">Character types</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> Uppercase (A–Z)
              </label>
              <label className="toggle">
                <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> Lowercase (a–z)
              </label>
              <label className="toggle">
                <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} /> Numbers (0–9)
              </label>
              <label className="toggle">
                <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> Symbols (!@#$...)
              </label>
            </div>
          </div>
          <button className="tool-btn tool-btn-primary" onClick={generate}>
            Generate Password
          </button>
          <div className="strength-meter">
            <label className="tool-label" style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}>Strength</label>
            <div className="strength-bar">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div key={lvl} className={`strength-seg ${lvl <= strength ? 'active' : ''}`} />
              ))}
            </div>
            <span className="strength-text">{['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength - 1] || '—'}</span>
          </div>
        </div>
        <div className="tool-header-row">
          <label className="tool-label">Result</label>
          <CopyButton text={password} />
        </div>
        <div className="tool-password-box">
          <div className="password-value">{password}</div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
