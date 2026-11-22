import { useEffect, useState, type HTMLAttributes } from 'react';
import { useInView } from '../lib/useInView';

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

type Props = { value: number; duration?: number } & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

/** A number that counts up from 0 the first time it scrolls into view. With reduced motion it just shows the value. */
export function CountUp({ value, duration = 1400, className = '', ...rest }: Props) {
  const [ref, status] = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(status === 'off' ? value : 0);

  useEffect(() => {
    if (status === 'off') {
      setShown(value);
      return;
    }
    if (status === 'waiting') {
      setShown(0);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} {...rest}>
      {shown}
    </span>
  );
}
