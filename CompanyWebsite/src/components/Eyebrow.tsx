import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/** The small uppercase, letter-spaced label used above every section title. It fades up as it scrolls into view. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Reveal as="p" className={`m-0 text-xs font-semibold uppercase tracking-[0.22em] text-eyebrow ${className}`}>
      {children}
    </Reveal>
  );
}
