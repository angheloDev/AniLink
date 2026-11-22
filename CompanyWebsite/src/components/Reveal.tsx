import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '../lib/useInView';

type Props = {
  /** The element to render. Defaults to a div. */
  as?: ElementType;
  /** Stagger: how many milliseconds to wait after scrolling into view. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

/**
 * Fades its content up the first time it scrolls into view. The hidden and shown looks live in motion.css, inside the
 * "no-preference" query, so with reduced motion (or no IntersectionObserver) the content is simply there.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className, style, children, ...rest }: Props) {
  const [ref, status] = useInView<HTMLElement>();
  const state = status === 'off' ? undefined : status === 'seen' ? 'shown' : 'hidden';
  const css = delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style;
  const Component = Tag as ElementType;
  return (
    <Component ref={ref} data-reveal={state} className={className} style={css} {...rest}>
      {children}
    </Component>
  );
}
