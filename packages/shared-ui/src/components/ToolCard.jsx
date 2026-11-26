import { Link } from 'react-router-dom';
import { Icons } from './Icons';

export const ToolCard = ({ tool, href }) => {
  const external = String(href).startsWith('http');
  const IconComponent = Icons[tool.icon];
  const CardLink = external ? 'a' : Link;
  return (
    <CardLink
      {...(external ? { href } : { to: href })}
      className="card-link"
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      <div className={`tool-card${tool.popular ? ' popular' : ''}`} data-category={tool.category}>
        {tool.popular && <span className="tool-badge">Popular</span>}
        {tool.badge && !tool.popular && <span className="tool-badge badge-new">{tool.badge}</span>}
        <div className="card-header">
          <div className="card-icon">
            <IconComponent />
          </div>
        </div>
        <div className="card-content">
          <h3>{tool.title}</h3>
          <p>{tool.description || tool.tagline}</p>
        </div>
        <div className="card-tags">
          {(tool.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </CardLink>
  );
};
