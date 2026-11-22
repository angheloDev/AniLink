import { act, renderHook } from '@testing-library/react-native';
import { countActiveFilters, filtersToParams } from '../src/lib/filters';
import { buildMapHtml, type MapMarker } from '../src/lib/mapHtml';
import { useDebounced } from '../src/lib/useDebounced';

const markers: MapMarker[] = [
  { id: 'abc123', lat: 6.9455, lng: 122.0915, label: 'Baguio Tomatoes', price: '₱82/kg' },
  { id: 'def456', lat: 7.015, lng: 121.982, label: 'x</script><b>boom</b>', price: '₱1,450/sack' },
];

describe('buildMapHtml', () => {
  it('includes every marker id and the Leaflet runtime', () => {
    const html = buildMapHtml(markers, { center: [6.9214, 122.079], online: true, dark: false });
    expect(html.includes('abc123')).toBe(true);
    expect(html.includes('def456')).toBe(true);
    expect(html.includes('L.map')).toBe(true);
    expect(html.includes('6.9214')).toBe(true);
  });

  it('loads OpenStreetMap tiles only when online', () => {
    expect(buildMapHtml(markers, { center: [6.9, 122], online: true, dark: false }).includes('tile.openstreetmap.org')).toBe(true);
    expect(buildMapHtml(markers, { center: [6.9, 122], online: false, dark: false }).includes('tile.openstreetmap.org')).toBe(false);
  });

  it('cannot be broken out of by a marker label containing </script>', () => {
    const html = buildMapHtml(markers, { center: [6.9, 122], online: true, dark: false });
    expect(html.includes('x</script><b>boom')).toBe(false);
    expect(html.includes('\u003c/script\u003e')).toBe(true);
  });

  it('applies a dark treatment to the tiles in dark mode', () => {
    expect(buildMapHtml(markers, { center: [6.9, 122], online: true, dark: true }).includes('invert(')).toBe(true);
    expect(buildMapHtml(markers, { center: [6.9, 122], online: true, dark: false }).includes('invert(')).toBe(false);
  });

  it('works with no markers', () => {
    expect(() => buildMapHtml([], { center: [6.9, 122], online: false, dark: true })).not.toThrow();
  });
});

describe('filters', () => {
  it('counts only meaningful active filters (sort and category are not counted)', () => {
    expect(countActiveFilters({ sort: 'newest' })).toBe(0);
    expect(countActiveFilters({ category: 'fruits', sort: 'price_asc' })).toBe(0);
    expect(countActiveFilters({ minPrice: 10, maxPrice: 50, verifiedOnly: true, barangay: 'Tumaga', preorder: false })).toBe(4);
    expect(countActiveFilters({ delivery: true, preorder: true })).toBe(2);
  });

  it('turns route params into filters, ignoring junk', () => {
    expect(filtersToParams({ category: 'fruits', sort: 'nearest', preorder: '1', q: 'mango' })).toEqual({ category: 'fruits', sort: 'nearest', preorder: true, q: 'mango' });
    expect(filtersToParams({ category: 'nonsense', sort: 'whatever' })).toEqual({});
    expect(filtersToParams({})).toEqual({});
  });
});

describe('useDebounced', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only updates after the delay has passed without changes', async () => {
    const { result, rerender } = await renderHook(({ v }: { v: string }) => useDebounced(v, 300), { initialProps: { v: 'a' } });
    expect(result.current).toBe('a');
    await rerender({ v: 'ab' });
    await rerender({ v: 'abc' });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
    await act(async () => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current).toBe('abc');
  });
});
