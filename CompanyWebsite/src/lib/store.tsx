import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StoreOverlay } from '../components/StoreOverlay';

export type StoreId = 'google' | 'apple';
export type StoreStage = 'closed' | 'redirecting' | 'card';
/** How long the fake "taking you to the store" screen shows. */
export const REDIRECT_MS = 1600;

interface StoreValue {
  stage: StoreStage;
  store: StoreId | null;
  open(store: StoreId): void;
  close(): void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ stage: StoreStage; store: StoreId | null }>({ stage: 'closed', store: null });
  const stageRef = useRef<StoreStage>('closed');
  const timer = useRef<number | undefined>(undefined);

  const clearTimer = () => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
  };

  const close = useCallback(() => {
    clearTimer();
    stageRef.current = 'closed';
    setState({ stage: 'closed', store: null });
  }, []);

  const open = useCallback((store: StoreId) => {
    if (stageRef.current !== 'closed') return; // a second click must not restart or stack the timer
    stageRef.current = 'redirecting';
    setState({ stage: 'redirecting', store });
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      stageRef.current = 'card';
      setState((s) => ({ ...s, stage: 'card' }));
    }, REDIRECT_MS);
  }, []);

  useEffect(() => clearTimer, []);

  const value = useMemo(() => ({ ...state, open, close }), [state, open, close]);
  return (
    <StoreContext.Provider value={value}>
      {children}
      <StoreOverlay stage={state.stage} store={state.store} onClose={close} redirectMs={REDIRECT_MS} />
    </StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
