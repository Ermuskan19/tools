import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

export const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [indent, setIndent] = useState(2);
  const [minified, setMinified] = useState(false);

  const format = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input || 'null');
      const result = minified ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      setOutput(result);
    } catch (err) {
      setOutput('');
      setError(err.message);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    setError(null);
    setOutput('');
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, validate, and beautify your JSON data instantly."
    >
      <div className="tool-two-pane">
        <div className="tool-panel input-pane">
          <label className="tool-label">JSON input</label>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={handleInput}
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
          <div className="tool-options">
            <label>
              <input
                type="radio"
                name="indent"
                value={2}
                checked={indent === 2}
                onChange={() => setIndent(2)}
              />
              Indent 2 spaces
            </label>
            <label>
              <input
                type="radio"
                name="indent"
                value={4}
                checked={indent === 4}
                onChange={() => setIndent(4)}
              />
              Indent 4 spaces
            </label>
            <label>
              <input
                type="radio"
                name="indent"
                value="\t"
                checked={indent === '\t'}
                onChange={() => setIndent('\t')}
              />
              Tab
            </label>
            <label style={{ marginLeft: 'auto' }}>
              <input
                type="checkbox"
                checked={minified}
                onChange={(e) => setMinified(e.target.checked)}
              />
              Minified output
            </label>
          </div>
          <button className="tool-btn tool-btn-primary" onClick={format}>
            Format JSON
          </button>
        </div>

        <div className="tool-panel output-pane">
          {error ? (
            <div className="tool-error">
              <strong>Invalid JSON:</strong> {error}
            </div>
          ) : (
            <>
              <div className="tool-header-row">
                <label className="tool-label">Formatted output</label>
                <CopyButton text={output} />
              </div>
              <textarea
                className="tool-textarea"
                value={output}
                readOnly
                spellCheck={false}
              />
              <div className="tool-actions">
                <button className="tool-btn tool-btn-outline" onClick={download} disabled={!output}>
                  Download .json
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};
