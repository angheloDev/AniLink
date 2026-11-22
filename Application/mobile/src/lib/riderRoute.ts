export type Point = [number, number];

/** Evenly spaced points from `from` to `to` (steps + 1 points, endpoints included). */
export function interpolateRoute(from: Point, to: Point, steps: number): Point[] {
  if (!(steps >= 1)) return [from, to];
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    if (i === 0) out.push([from[0], from[1]]);
    else if (i === steps) out.push([to[0], to[1]]);
    else out.push([from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps]);
  }
  return out;
}
