import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'in',
  'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum'
];

const LoremIpsum = () => {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState('paragraphs');
  const [output, setOutput] = useState('');

  const generate = () => {
    let output;
    if (unit === 'words') {
      output = generateWords(count);
    } else if (unit === 'sentences') {
      output = generateSentences(count);
    } else {
      output = generateParagraphs(count);
    }
    setOutput(output);
  };

  const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

  const generateWords = (n) => {
    const words = [];
    for (let i = 0; i < n; i++) words.push(randomWord());
    return words.join(' ');
  };

  const generateSentences = (n) => {
    const sentences = [];
    for (let i = 0; i < n; i++) {
      const len = 5 + Math.floor(Math.random() * 12);
      const words = [];
      for (let j = 0; j < len; j++) words.push(randomWord());
      sentences.push(words[0].charAt(0).toUpperCase() + words[0].slice(1) + words.slice(1).join(' ') + '.');
    }
    return sentences.join(' ');
  };

  const generateParagraphs = (n) => {
    const paragraphs = [];
    for (let i = 0; i < n; i++) {
      const sentences = 2 + Math.floor(Math.random() * 4);
      paragraphs.push(generateSentences(sentences));
    }
    return paragraphs.join('\n\n');
  };

  return (
    <ToolLayout title="Lorem Ipsum Gen" description="Generate custom placeholder text for your mockups.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-group">
            <label className="tool-label">Amount</label>
            <input className="tool-input" type="number" min="1" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} />
          </div>
          <div className="control-group">
            <label className="tool-label">Unit</label>
            <div className="unit-toggle">
              <button className={`unit-btn ${unit === 'paragraphs' ? 'active' : ''}`} onClick={() => setUnit('paragraphs')}>Paragraphs</button>
              <button className={`unit-btn ${unit === 'sentences' ? 'active' : ''}`} onClick={() => setUnit('sentences')}>Sentences</button>
              <button className={`unit-btn ${unit === 'words' ? 'active' : ''}`} onClick={() => setUnit('words')}>Words</button>
            </div>
          </div>
          <button className="tool-btn tool-btn-primary" onClick={generate}>Generate</button>
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

export default LoremIpsum;
