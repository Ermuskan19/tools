import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// useLayoutEffect warns when rendered on the server (the apps prerender their
// routes), so fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// The app stylesheets set `scroll-behavior: smooth` on <html>, which makes a
// plain window.scrollTo(0, 0) animate from the old offset instead of opening
// the new page at the top. Force an instant jump and restore the style after.
const scrollToPosition = (top) => {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = previous;
};

// Hash targets can render a frame or two after navigation (lazy content,
// prerendered hydration), so retry briefly before giving up and using the top.
const scrollToHash = (hash) => {
  const id = decodeURIComponent(hash.slice(1));
  let frames = 0;
  const step = () => {
    const el = document.getElementById(id);
    if (el) {
      scrollToPosition(el.getBoundingClientRect().top + window.scrollY);
    } else if (frames++ < 20) {
      requestAnimationFrame(step);
    } else {
      scrollToPosition(0);
    }
  };
  requestAnimationFrame(step);
};

/**
 * Opens every route at the top of the page (or at its #hash target).
 * Mount once, inside the router.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Stop the browser from restoring the previous offset on reload or back.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Layout effect: reset before the new page paints, so it never flashes at
  // the previous page's scroll offset.
  useIsomorphicLayoutEffect(() => {
    if (hash) scrollToHash(hash);
    else scrollToPosition(0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
