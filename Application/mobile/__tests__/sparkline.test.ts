import { sparklinePoints, trendDelta } from '../src/lib/sparkline';

describe('sparklinePoints', () => {
  it('spreads points evenly across the width and maps the min to the bottom and the max to the top', () => {
    const p = sparklinePoints([10, 20, 15], 100, 40, 0);
    expect(p).toHaveLength(3);
    expect(p[0]).toEqual({ x: 0, y: 40 });
    expect(p[1]).toEqual({ x: 50, y: 0 });
    expect(p[2].x).toBe(100);
    expect(p[2].y).toBeCloseTo(20, 5);
  });

  it('keeps the line inside the padding', () => {
    const p = sparklinePoints([1, 3], 100, 40, 4);
    expect(p[0]).toEqual({ x: 4, y: 36 });
    expect(p[1]).toEqual({ x: 96, y: 4 });
  });

  it('draws a flat series in the middle rather than dividing by zero', () => {
    const p = sparklinePoints([5, 5, 5], 90, 30, 0);
    expect(p.every((pt) => pt.y === 15)).toBe(true);
    expect(p.map((pt) => pt.x)).toEqual([0, 45, 90]);
  });

  it('handles one point and no points', () => {
    expect(sparklinePoints([7], 100, 40, 0)).toEqual([{ x: 50, y: 20 }]);
    expect(sparklinePoints([], 100, 40, 0)).toEqual([]);
  });
});

describe('trendDelta', () => {
  it('reports the change from the first to the last value as a signed percent', () => {
    expect(trendDelta([80, 90])).toBe(12.5);
    expect(trendDelta([100, 90])).toBe(-10);
    expect(trendDelta([50, 50])).toBe(0);
  });

  it('is zero for too little data or a zero baseline', () => {
    expect(trendDelta([])).toBe(0);
    expect(trendDelta([5])).toBe(0);
    expect(trendDelta([0, 5])).toBe(0);
  });
});
