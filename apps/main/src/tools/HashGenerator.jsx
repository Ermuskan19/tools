import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [hash, setHash] = useState('');
  const [encoding, setEncoding] = useState('hex');

  const compute = async () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const buffer = await crypto.subtle.digest(algorithm, data);
      const bytes = new Uint8Array(buffer);
      if (encoding === 'hex') {
        setHash([...bytes].map(b => b.toString(16).padStart(2, '0')).join(''));
      } else {
        setHash(btoa(String.fromCharCode(...bytes)));
      }
    } catch {
      setHash('');
    }
  };

  return (
    <ToolLayout title="Hash Generator" description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 digests of text using Web Crypto.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Input text</label>
          <textarea className="tool-textarea" value={input} onChange={(e) => { setInput(e.target.value); setHash(''); }} spellCheck={false} placeholder="Enter text to hash..." />
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Algorithm</label>
              <select className="tool-input" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setHash(''); }}>
                {ALGORITHMS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Output</label>
              <select className="tool-input" value={encoding} onChange={(e) => { setEncoding(e.target.value); setHash(''); }}>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
          </div>
          <button className="tool-btn tool-btn-primary" onClick={compute} disabled={!input}>Generate Hash</button>
        </div>
        <div className="tool-header-row">
          <label className="tool-label">Hash</label>
          <CopyButton text={hash} />
        </div>
        <div className="tool-password-box">
          <div className="password-value">{hash}</div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HashGenerator;
