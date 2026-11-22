import { useTheme } from '../lib/theme';

type Variant = 'mark' | 'stacked' | 'lockup';

/**
 * The AniLink logo. `stacked` is the full logo (mark over wordmark); `lockup` is the mark beside
 * the wordmark, made by cropping the stacked logo to its lettering so the brand type stays exact.
 * The wordmark image follows the theme (mint on dark, deep green on light).
 */
export function Logo({ variant, className = '' }: { variant: Variant; className?: string }) {
  const { theme } = useTheme();
  const stacked = theme === 'dark' ? '/logos/loading-dark.png' : '/logos/loading-light.png';

  if (variant === 'mark') {
    return <img src="/logos/mark.png" alt="AniLink" width={80} height={80} className={className} />;
  }
  if (variant === 'stacked') {
    return <img src={stacked} alt="AniLink" width={160} height={184} className={className} />;
  }
  return (
    <span role="img" aria-label="AniLink" className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src="/logos/mark.png" alt="" aria-hidden width={40} height={40} className="size-10" />
      <span aria-hidden className="block h-[18px] aspect-[1280/236] overflow-hidden">
        <img src={stacked} alt="" className="size-full object-cover object-bottom" />
      </span>
    </span>
  );
}
