import { describe, expect, it } from 'vitest';
import { MAP_PINS, ROUTE, VIEWBOX, project } from '../src/lib/mapData';
import { pointOnPolyline } from '../src/lib/route';

describe('pointOnPolyline', () => {
  const path: [number, number][] = [
    [0, 0],
    [10, 0],
    [10, 10],
  ];
  it('lands on the vertex halfway along an L-shaped path', () => {
    expect(pointOnPolyline(path, 0.5)).toEqual([10, 0]);
  });
  it('interpolates inside a segment', () => {
    expect(pointOnPolyline(path, 0.25)).toEqual([5, 0]);
    expect(pointOnPolyline(path, 0.75)).toEqual([10, 5]);
  });
  it('hits the ends at t=0 and t=1', () => {
    expect(pointOnPolyline(path, 0)).toEqual([0, 0]);
    expect(pointOnPolyline(path, 1)).toEqual([10, 10]);
  });
  it('clamps t outside 0..1', () => {
    expect(pointOnPolyline(path, -1)).toEqual([0, 0]);
    expect(pointOnPolyline(path, 2)).toEqual([10, 10]);
  });
  it('handles an empty, single-point or zero-length path without NaN', () => {
    expect(pointOnPolyline([], 0.5)).toEqual([0, 0]);
    expect(pointOnPolyline([[3, 4]], 0.5)).toEqual([3, 4]);
    const flat = pointOnPolyline(
      [
        [2, 2],
        [2, 2],
      ],
      0.5,
    );
    expect(flat).toEqual([2, 2]);
  });
});

describe('map data', () => {
  it('projects every pin inside the viewBox', () => {
    expect(MAP_PINS.length).toBeGreaterThanOrEqual(5);
    for (const pin of MAP_PINS) {
      const [x, y] = project(pin.lat, pin.lng);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(VIEWBOX.w);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(VIEWBOX.h);
    }
  });
  it('has a delivery route with at least three points', () => {
    expect(ROUTE.length).toBeGreaterThanOrEqual(3);
  });
});
