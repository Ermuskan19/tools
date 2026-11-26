import { imgTools, imgToolsBySlug, imgCategories } from '../data/imgTools';
import { useMemo } from 'react';
import { Header, Toolbar, Steps, Faqs, Highlights, CTA } from '../components/SharedComponents';

const DevToolPage = ({
  title,
  description,
  tools,
  categories,
}) => {
  const toolMap = useMemo(() => Object.fromEntries(tools.map((t) => [t.slug, t])), [tools]);

  return (
    <section className="workspace">
      <Header title={title} description={description} />

      <Toolbar categories={categories} tools={tools} toolMap={toolMap} />

      <section className="tool-grid">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="tool-card"
            onClick={() => window.location.href = `/img/${tool.slug}`}
          >
            <Icons[tool.icon] className="icon" />
            <h3 className="title">{tool.title}</h3>
            <p className="tagline">{tool.tagline}</p>
            <p className="desc">{tool.description}</p>
          </div>
        ))}
      </section>

      <CTA
        title="Choose a tool above"
        text="All image tools run in your browser — no upload ever leaves your device."
      />
    </section>
  );
};

export { DevToolPage };