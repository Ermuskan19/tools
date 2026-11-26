import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const UrlEncode = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('encode');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  const convert = () => {
    setError(null);
    setOutput('');
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ToolLayout title="URL Encode/Decode" description="Percent-encode or decode URL query strings and paths safely.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'encode' ? 'active' : ''}`} onClick={() => { setMode('encode'); setError(null); setOutput(''); }}>Encode</button>
            <button className={`mode-btn ${mode === 'decode' ? 'active' : ''}`} onClick={() => { setMode('decode'); setError(null); setOutput(''); }}>Decode</button>
          </div>
          <label className="tool-label">{mode === 'encode' ? 'Text to encode' : 'URL to decode'}</label>
          <textarea className="tool-textarea" value={input} onChange={(e) => { setInput(e.target.value); setError(null); setOutput(''); }} spellCheck={false} />
          <button className="tool-btn tool-btn-primary" onClick={convert}>
            {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
          </button>
          {error && <div className="tool-error">{error}</div>}
        </div>
        <div className="tool-header-row">
          <label className="tool-label">Result</label>
          <CopyButton text={output} />
        </div>
        <textarea className="tool-textarea" value={output} readOnly spellCheck={false} />
      </div>
    </ToolLayout>
  );
};

export default UrlEncode;
