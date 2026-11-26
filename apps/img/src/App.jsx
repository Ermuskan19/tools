import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@zegnite/shared-ui';
import ImgHome from './pages/ImgHome';
import ImgToolPage from './pages/ImgToolPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ImgHome />} />
        <Route path="/:slug" element={<ImgToolPage />} />
      </Routes>
    </>
  );
}
