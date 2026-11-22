import { useCallback, useEffect, useRef, useState } from 'react';

/** Pause after each demo click so a double-click can't skip a beat of the story. */
export const STEP_COOLDOWN_MS = 600;

/** A scripted demo that advances one step per click (0..last), with a short lock after each click. */
export function useStepper(last: number, cooldownMs = STEP_COOLDOWN_MS) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const stepRef = useRef(0);
  const locked = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const advance = useCallback(() => {
    if (locked.current || stepRef.current >= last) return;
    stepRef.current += 1;
    setStep(stepRef.current);
    locked.current = true;
    setBusy(true);
    timer.current = window.setTimeout(() => {
      locked.current = false;
      setBusy(false);
    }, cooldownMs);
  }, [last, cooldownMs]);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    stepRef.current = 0;
    locked.current = false;
    setStep(0);
    setBusy(false);
  }, []);

  return { step, busy, advance, reset };
}
