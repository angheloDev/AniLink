export const MAX_ITEMS = 30;
export const MAX_ITEM_LENGTH = 30;

const sameItem = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** "dragon  fruit" -> "Dragon Fruit". */
function tidy(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_ITEM_LENGTH)
    .trim()
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_, space: string, ch: string) => space + ch.toUpperCase());
}

/** Turns what a person typed ("lanzones, durian; ube") into clean, distinct item names. */
export function parseItems(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(/[,;\n]/)) {
    const item = tidy(part);
    if (item && !out.some((o) => sameItem(o, item))) out.push(item);
  }
  return out;
}

/**
 * Adds everything typed in `text` to `current`: several at once, no repeats (any capitalization),
 * the suggested spelling wins, and the list never grows past MAX_ITEMS.
 */
export function addItems(current: string[], text: string, known: string[] = [], max = MAX_ITEMS): string[] {
  const next = [...current];
  for (const item of parseItems(text)) {
    if (next.length >= max) break;
    if (next.some((c) => sameItem(c, item))) continue;
    next.push(known.find((k) => sameItem(k, item)) ?? item);
  }
  return next;
}

export function toggleItem(current: string[], item: string): string[] {
  return current.includes(item) ? current.filter((c) => c !== item) : [...current, item];
}
