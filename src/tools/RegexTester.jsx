import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'];

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const RegexTester = () => {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [testString, setTestString] = useState('Contact us at support@example.com or sales@example.org.');

  const { matches, highlighted, invalid } = useMemo(() => {
    const resultMatches = [];

    try {
      const scanner = new RegExp(pattern, flags);
      let m;
      while ((m = scanner.exec(testString)) !== null) {
        resultMatches.push({ index: m.index, groups: m.slice(1), full: m[0] });
        if (scanner.lastIndex === m.index) scanner.lastIndex++;
      }
    } catch (err) {
      return { matches: [], highlighted: escapeHtml(testString), invalid: err.message };
    }

    // Rebuild the preview with matches wrapped, escaping the user's text so
    // markup inside it can't be interpreted as HTML.
    let html = '';
    let cursor = 0;
    for (const match of resultMatches) {
      if (match.index < cursor) continue;
      html += escapeHtml(testString.slice(cursor, match.index));
      html += `<mark>${escapeHtml(match.full)}</mark>`;
      cursor = match.index + match.full.length;
    }
    html += escapeHtml(testString.slice(cursor));

    return { matches: resultMatches, highlighted: html, invalid: null };
  }, [pattern, flags, testString]);

  const toggleFlag = (flag) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  return (
    <ToolLayout title="Regex Tester" description="Test and debug regular expressions with real-time highlighting.">
      <div className="tool-two-pane">
        <div className="tool-panel input-pane">
          <label className="tool-label">Pattern</label>
          <input className="tool-input" value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} />
          <div className="tool-flags">
            {FLAGS.map((f) => (
              <button
                key={f}
                className={`flag-btn ${flags.includes(f) ? 'active' : ''}`}
                onClick={() => toggleFlag(f)}
              >
                {f}
              </button>
            ))}
            <span className="flag-help">g global · i ignore case · m multiline · s dotAll · u unicode · y sticky</span>
          </div>
          <label className="tool-label">Test string</label>
          <textarea className="tool-textarea" value={testString} onChange={(e) => setTestString(e.target.value)} spellCheck={false} />
          {invalid && <div className="tool-error"><strong>Invalid regex:</strong> {invalid}</div>}
        </div>

        <div className="tool-panel output-pane">
          <div className="tool-header-row">
            <label className="tool-label">Matches ({matches.length})</label>
            <CopyButton text={JSON.stringify(matches, null, 2)} />
          </div>
          <div className="tool-preview" dangerouslySetInnerHTML={{ __html: highlighted }} />
          {matches.length > 0 && (
            <div className="tool-match-list">
              {matches.map((m, i) => (
                <div key={i} className="tool-match-item">
                  <span className="tool-match-index">#{i + 1}</span>
                  <span className="tool-match-full">{m.full}</span>
                  <span className="tool-match-index">index {m.index}</span>
                  {m.groups.length > 0 && (
                    <div className="tool-groups">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="tool-group">{`$${gi + 1}: ${g}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default RegexTester;
