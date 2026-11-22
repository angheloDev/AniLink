/**
 * Navigation can only be used once the root <Stack> has mounted (after fonts and the saved session load).
 * Code that may run earlier (opening a screen from a tapped notification on cold start) waits on this.
 */
let ready = false;
let waiters: (() => void)[] = [];

export function markNavReady(): void {
  if (ready) return;
  ready = true;
  waiters.forEach((w) => w());
  waiters = [];
}

export function whenNavReady(): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}

/** For tests. */
export function resetNavReady(): void {
  ready = false;
  waiters = [];
}
