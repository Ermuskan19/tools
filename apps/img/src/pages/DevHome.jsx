import { imgTools, imgCategories } from '../data/imgTools';
import { DevToolPage } from '../pages/DevToolPage';

const DevHome = () => {
  return (
    <DevToolPage
      title="Image Tools"
      description="Free online image tools that run entirely in your browser"
      tools={imgTools}
      categories={imgCategories}
    />
  );
};

export default DevHome;