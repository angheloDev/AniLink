import { useEffect, useRef } from 'react';

/**
 * When a scripted demo ends, its action button disappears and keyboard focus would fall back to the
 * page. This returns a ref for the "Reset" button and moves focus there, but only if focus was lost.
 */
export function useFocusResetWhenDone<T extends HTMLElement>(done: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (done && document.activeElement === document.body) ref.current?.focus();
  }, [done]);
  return ref;
}
