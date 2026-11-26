import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const STYLES = {
  listicle: (k) => [`10 ${k} Tips That Actually Work`, `7 Mistakes to Avoid With ${k}`, `5 ${k} Hacks You Will Use Daily`, `The Ultimate ${k} Guide for Beginners`, `3 ${k} Myths Debunked`],
  howto: (k) => [`How to Master ${k} in 30 Days`, `How I Improved My ${k} by 200%`, `How to Get Started With ${k} (Step by Step)`, `How to Avoid the Biggest ${k} Mistakes`],
  question: (k) => [`Is ${k} Actually Worth It?`, `Why Is ${k} So Hard to Learn?`, `What Nobody Tells You About ${k}`, `Do You Make These ${k} Mistakes?`],
  beginner: (k) => [`${k} for Absolute Beginners`, `${k} Explained in 5 Minutes`, `Understanding ${k}: The Basics`, `Your First ${k}: What to Know`]
};

const YoutubeTitleGenerator = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('listicle');

  const titles = useMemo(() => (topic.trim() ? STYLES[style](topic.trim()) : []), [topic, style]);

  return (
    <ToolLayout title="YouTube Title Generator" description="Generate click-worthy YouTube video titles from your topic keyword.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Video topic</label>
              <input className="tool-input" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. budget travel in India" />
            </div>
            <div className="control-group">
              <label className="tool-label">Style</label>
              <select className="tool-input" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="listicle">Listicle</option>
                <option value="howto">How-to</option>
                <option value="question">Question</option>
                <option value="beginner">Beginner</option>
              </select>
            </div>
          </div>
        </div>

        {titles.length > 0 && (
          <div className="result-list">
            <div className="tool-header-row">
              <label className="tool-label">{titles.length} title ideas</label>
              <CopyButton text={titles.join('\n')} />
            </div>
            {titles.map((t, i) => (
              <div key={i} className="result-row">
                <span className={`badge${t.length > 60 ? ' badge-warn' : ''}`}>{t.length}/60</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default YoutubeTitleGenerator;
