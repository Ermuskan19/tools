import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const Base64 = () => {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const encode = (str) => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (str) => {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  };

  const convert = () => {
    setError(null);
    setOutput('');
    try {
      if (mode === 'encode') {
        setOutput(encode(input));
      } else {
        setOutput(decode(input));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ToolLayout title="Base64 Encode/Decode" description="Quickly encode or decode strings to Base64 format.">
      <div className="tool-two-pane">
        <div className="tool-panel input-pane">
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>Encode</button>
            <button className={`mode-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>Decode</button>
          </div>
          <label className="tool-label">{mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}</label>
          <textarea className="tool-textarea" value={input} onChange={(e) => { setInput(e.target.value); setError(null); setOutput(''); }} spellCheck={false} />
          <button className="tool-btn tool-btn-primary" onClick={convert}>
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </button>
          {error && <div className="tool-error">{error}</div>}
        </div>

        <div className="tool-panel output-pane">
          <div className="tool-header-row">
            <label className="tool-label">Result</label>
            <CopyButton text={output} />
          </div>
          <textarea className="tool-textarea" value={output} readOnly spellCheck={false} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default Base64;
