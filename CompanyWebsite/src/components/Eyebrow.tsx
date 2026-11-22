import type { ReactNode } from 'react';

/** The small uppercase, letter-spaced label with a leading rule, used above every section title. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`m-0 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-eyebrow ${className}`}>
      <span aria-hidden className="h-px w-8 bg-eyebrow" />
      {children}
    </p>
  );
}
