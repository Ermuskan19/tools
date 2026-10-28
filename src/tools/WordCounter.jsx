import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const WordCounter = () => {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
  const readingTime = Math.max(1, Math.round(words / 200));

  const handleInput = (e) => setText(e.target.value);

  return (
    <ToolLayout title="Word & Character Counter" description="Count words, characters, sentences, and estimate reading time as you type.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <label className="tool-label">Enter your text</label>
          <textarea
            className="tool-textarea"
            value={text}
            onChange={handleInput}
            placeholder="Type or paste text here..."
            spellCheck={false}
          />
          <div className="control-row stats-row">
            <div className="stat-card">
              <div className="stat-value">{words}</div>
              <div className="stat-label">Words</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{chars}</div>
              <div className="stat-label">Characters</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{charsNoSpaces}</div>
              <div className="stat-label">Chars (no spaces)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{sentences}</div>
              <div className="stat-label">Sentences</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{paragraphs}</div>
              <div className="stat-label">Paragraphs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{readingTime}</div>
              <div className="stat-label">min read</div>
            </div>
          </div>
        </div>
        <div className="tool-header-row">
          <label className="tool-label">Result</label>
          <CopyButton text={text} />
        </div>
        <textarea className="tool-textarea" value={text} readOnly spellCheck={false} />
      </div>
    </ToolLayout>
  );
};

export default WordCounter;
