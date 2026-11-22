import type { ReactNode } from 'react';

/** A phone shell. It scales with its container (up to 320px wide) and clips whatever app screen it holds. */
export function PhoneFrame({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`relative mx-auto aspect-[9/18.5] w-full max-w-[320px] overflow-hidden rounded-[44px] border-[10px] border-[#0b0b0a] bg-bg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-border ${className}`}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0b0b0a]" />
      <div className="flex h-full min-h-0 flex-col pt-9 text-text">
        <div aria-hidden className="flex items-center justify-between px-6 pb-1 text-[10px] font-semibold text-muted">
          <span>9:41</span>
          <span className="tracking-widest">●●●</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
