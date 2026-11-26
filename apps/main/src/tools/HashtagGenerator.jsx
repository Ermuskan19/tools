import { useState, useMemo } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const PLATFORMS = {
  instagram: { prefixes: ['', '#'], label: 'Instagram' },
  youtube: { prefixes: ['', '#'], label: 'YouTube' },
  linkedin: { prefixes: ['', '#'], label: 'LinkedIn' },
  x: { prefixes: ['#'], label: 'X / Twitter' }
};

// Topic → hashtag sets: broad, niche and long-tail mixes built from the topic words.
const buildTags = (topic, platform) => {
  const words = topic.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
  if (words.length === 0) return [];
  const base = words.join('');
  const joined = words.join('');
  const phrase = words.join('');
  const niche = words.map(w => `${w}tips`);
  const longTail = [`${phrase}ideas`, `${joined}community`, `${words[0]}lover`, `daily${joined}`];
  const generic = ['trending', 'viral', 'explore', 'reels', 'fyp', 'instagood'].slice(0, platform === 'x' ? 2 : 4);
  const set = [...new Set([base, phrase, ...words, ...niche, ...longTail, ...generic])];
  return set.map(t => `#${t.replace(/\s+/g, '')}`).slice(0, 20);
};

const HashtagGenerator = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [count, setCount] = useState(12);

  const tags = useMemo(() => buildTags(topic, platform).slice(0, count), [topic, platform, count]);
  const output = tags.join(' ');

  return (
    <ToolLayout title="Hashtag Generator" description="Generate relevant hashtags for Instagram, YouTube, and LinkedIn posts from a topic.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Post topic or keyword</label>
              <input className="tool-input" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. home workout" />
            </div>
            <div className="control-group">
              <label className="tool-label">Platform</label>
              <select className="tool-input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Count</label>
              <input className="tool-input" type="number" min="3" max="30" value={count} onChange={(e) => setCount(Math.min(30, Math.max(3, Number(e.target.value) || 3)))} />
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <>
            <div className="tool-header-row">
              <label className="tool-label">Your hashtags</label>
              <CopyButton text={output} />
            </div>
            <div className="chip-cloud">
              {tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <textarea className="tool-textarea" rows={3} readOnly value={output} />
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default HashtagGenerator;
