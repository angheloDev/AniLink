import { useEffect, useRef } from 'react';
import { scrollFraction } from '../lib/scroll';

/** A thin bar across the top of the page that fills as you scroll down. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const el = bar.current;
      if (!el) return;
      el.style.transform = `scaleX(${scrollFraction(window.scrollY, document.documentElement.scrollHeight, window.innerHeight)})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return (
    <div
      ref={bar}
      aria-hidden
      data-testid="scroll-progress"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-eyebrow via-sun to-accent"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
