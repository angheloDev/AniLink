import { useEffect, useState } from 'react';

/** How far down the page you are, from 0 (top) to 1 (bottom). Never leaves that range, and is 0 on a page too short to scroll. */
export function scrollFraction(scrollY: number, scrollHeight: number, viewport: number): number {
  const range = scrollHeight - viewport;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / range));
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);
  return scrolled;
}
