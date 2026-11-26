import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './Icons';
import '../styles/tools.css';

export const ToolLayout = ({ title, description, children, backLabel = 'Back to tools' }) => {
  // Keep the document head in sync on client-side navigation.
  // The prerender build injects the same tags statically for crawlers.
  useEffect(() => {
    document.title = `${title} | 3toOne`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <Link to="/" className="tool-back">
          <Icons.ArrowLeft className="back-arrow" /> {backLabel}
        </Link>
        <div className="tool-info">
          <h1 className="tool-title">{title}</h1>
          <p className="tool-desc">{description}</p>
        </div>
      </div>
      <div className="tool-page-body">{children}</div>
    </div>
  );
};
