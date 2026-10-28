import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were', 'it', 'this', 'that', 'as', 'at', 'by', 'from', 'be', 'has', 'have', 'will', 'your', 'you']);

const KeywordDensityChecker = () => {
  const [text, setText] = useState('');
  const [hideStop, setHideStop] = useState(true);

  const stats = useMemo(() => {
    const words = (text.toLowerCase().match(/[a-z0-9']+/g) || []);
    const total = words.length;
    const counts = {};
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    const rows = Object.entries(counts)
      .map(([word, count]) => ({ word, count, pct: total ? (count / total) * 100 : 0, stop: STOP.has(word) }))
      .filter(r => (hideStop ? !r.stop : true))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, 30);
    return { total, rows };
  }, [text, hideStop]);

  return (
    <ToolLayout title="Keyword Density Checker" description="Analyze keyword frequency and density in any text for SEO content tuning.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Paste your content</label>
          <textarea
            className="tool-textarea"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the article or page copy you want to analyze…"
          />
          <label className="check-row">
            <input type="checkbox" checked={hideStop} onChange={(e) => setHideStop(e.target.checked)} />
            Hide common stop words (the, and, of…)
          </label>
        </div>

        <div className="control-row stats-row">
          <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total words</div></div>
          <div className="stat-card"><div className="stat-value">{stats.rows.length}</div><div className="stat-label">Unique terms shown</div></div>
        </div>

        {stats.rows.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Keyword</th><th>Count</th><th>Density</th></tr>
            </thead>
            <tbody>
              {stats.rows.map(r => (
                <tr key={r.word}>
                  <td>{r.word}</td>
                  <td>{r.count}</td>
                  <td>{r.pct.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ToolLayout>
  );
};

export default KeywordDensityChecker;
