export type QueryValue = string | number | boolean | null | undefined;

/** "?a=1&b=x" from an object; skips undefined/null/empty/false values, booleans become 1. */
export function buildQuery(params: Record<string, QueryValue>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v === true ? '1' : String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
