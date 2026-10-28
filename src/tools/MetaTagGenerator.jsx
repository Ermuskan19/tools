import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { CopyButton } from '../components/CopyButton';

const MetaTagGenerator = () => {
  const [title, setTitle] = useState('My Website — Home');
  const [description, setDescription] = useState('A short, compelling description of this page for search results.');
  const [url, setUrl] = useState('https://example.com');
  const [image, setImage] = useState('https://example.com/og-image.jpg');
  const [robots, setRobots] = useState('index, follow');
  const [twitter, setTwitter] = useState('@sitehandle');

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const code = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta name="robots" content="${esc(robots)}" />`,
    '',
    '<!-- Open Graph -->',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    '',
    '<!-- Twitter -->',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${esc(twitter)}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`
  ].join('\n');

  return (
    <ToolLayout title="Meta Tag Generator" description="Generate SEO and Open Graph meta tags for your website and copy the HTML.">
      <div className="tool-pane-single">
        <div className="tool-controls">
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Page title ({title.length} chars)</label>
              <input className="tool-input" type="text" value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="control-row">
            <div className="control-group grow">
              <label className="tool-label">Meta description ({description.length} chars)</label>
              <textarea className="tool-textarea" rows={2} value={description} maxLength={170} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Page URL</label>
              <input className="tool-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="control-group">
              <label className="tool-label">OG image URL</label>
              <input className="tool-input" type="url" value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
          </div>
          <div className="control-row">
            <div className="control-group">
              <label className="tool-label">Robots</label>
              <select className="tool-input" value={robots} onChange={(e) => setRobots(e.target.value)}>
                <option value="index, follow">index, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
                <option value="index, nofollow">index, nofollow</option>
              </select>
            </div>
            <div className="control-group">
              <label className="tool-label">Twitter handle</label>
              <input className="tool-input" type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="tool-header-row">
          <label className="tool-label">Generated HTML</label>
          <CopyButton text={code} />
        </div>
        <pre className="code-block">{code}</pre>
      </div>
    </ToolLayout>
  );
};

export default MetaTagGenerator;
