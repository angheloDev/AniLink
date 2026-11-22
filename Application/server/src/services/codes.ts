const store = new Map<string, { code: string; expires: number }>();

export function issueCode(key: string, ttlMs = 5 * 60_000): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(key, { code, expires: Date.now() + ttlMs });
  return code;
}

export function consumeCode(key: string, code: string): boolean {
  const e = store.get(key);
  if (!e || e.expires < Date.now() || e.code !== code) return false;
  store.delete(key);
  return true;
}
