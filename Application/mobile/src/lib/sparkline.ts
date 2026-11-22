export interface SparkPoint {
  x: number;
  y: number;
}

/** Points for a line chart inside a w x h box with padding. The lowest value sits at the bottom. */
export function sparklinePoints(values: number[], w: number, h: number, pad = 0): SparkPoint[] {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  return values.map((v, i) => ({
    x: values.length === 1 ? w / 2 : pad + (innerW * i) / (values.length - 1),
    y: max === min ? h / 2 : pad + innerH - ((v - min) / (max - min)) * innerH,
  }));
}

/** Percent change from the first to the last value (0 when it cannot be computed). */
export function trendDelta(values: number[]): number {
  if (values.length < 2 || values[0] === 0) return 0;
  const d = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  return Math.round(d * 10) / 10;
}
