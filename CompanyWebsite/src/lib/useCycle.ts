import { useEffect, useState } from 'react';

/** Index that steps 0..length-1 and wraps, every `ms`, only while `enabled`. */
export function useCycle(length: number, ms: number, enabled: boolean): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!enabled || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms, enabled]);
  return index;
}
