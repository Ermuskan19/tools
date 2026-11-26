import { useState } from 'react';

export const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button onClick={handleCopy} className="copy-btn" aria-label={copied ? 'Copied!' : 'Copy to clipboard'}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};
