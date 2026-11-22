import { useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from './reducedMotion';

/**
 * 'off'     no animation wanted or possible (reduced motion, or no IntersectionObserver): show the finished page.
 * 'waiting' the element has not been on screen yet.
 * 'seen'    it has scrolled into view (and stays 'seen').
 */
export type InViewStatus = 'off' | 'waiting' | 'seen';

export function useInView<T extends Element = HTMLElement>(): [RefObject<T | null>, InViewStatus] {
  const reduced = useReducedMotion();
  const ref = useRef<T>(null);
  const supported = typeof IntersectionObserver !== 'undefined';
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (reduced || !supported || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, supported, seen]);

  return [ref, reduced || !supported ? 'off' : seen ? 'seen' : 'waiting'];
}
