import { BARANGAYS, barangayCoords, filterBarangays, normalizeBarangayName } from '../src/lib/barangays';

describe('barangay data', () => {
  it('lists all 98 official barangays of Zamboanga City, each once', () => {
    expect(BARANGAYS).toHaveLength(98);
    expect(new Set(BARANGAYS.map((b) => b.name)).size).toBe(98);
  });

  it('keeps every coordinate inside the Zamboanga City area', () => {
    const outside = BARANGAYS.filter((b) => b.lat < 6.8 || b.lat > 7.5 || b.lng < 121.85 || b.lng > 122.45).map((b) => b.name);
    expect(outside).toEqual([]);
  });

  it('includes the barangays the demo uses', () => {
    const names = BARANGAYS.map((b) => b.name);
    for (const n of ['Tumaga', 'Pasonanca', 'Talisayan', 'Vitali', 'Ayala', 'Mercedes', 'Culianan', 'Manicahan']) expect(names).toContain(n);
  });

  it('uses the official spellings, not abbreviations or look-alikes', () => {
    const names = BARANGAYS.map((b) => b.name);
    for (const n of ['Santa Maria', 'Santa Barbara', 'Santa Catalina', 'Santo Niño', 'Sinunoc', 'Limaong', 'Talon-Talon', 'San Jose Cawa-Cawa', 'Zone IV (Poblacion)', 'Dulian (Upper Bunguiao)', 'Dulian (Upper Pasonanca)', 'Busay (Sacol Island)']) {
      expect(names).toContain(n);
    }
    for (const wrong of ['Sta. Maria', 'Zone IV', 'Sinunuc', 'San Ramon']) expect(names).not.toContain(wrong);
    expect(names.filter((n) => /\bSta\.|\bSto\./.test(n))).toEqual([]);
  });

  it('is sorted alphabetically so a long list is easy to scan', () => {
    const names = BARANGAYS.map((b) => b.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
  });
});

describe('filterBarangays', () => {
  it('returns everything for an empty query', () => {
    expect(filterBarangays('')).toHaveLength(BARANGAYS.length);
    expect(filterBarangays('   ')).toHaveLength(BARANGAYS.length);
  });

  it('matches case-insensitively on any part of the name', () => {
    expect(filterBarangays('tum').map((b) => b.name)).toContain('Tumaga');
    expect(filterBarangays('SAN').map((b) => b.name)).toContain('San Roque');
  });

  it('ignores accents, so "santo nino" finds Santo Niño', () => {
    expect(filterBarangays('santo nino').map((b) => b.name)).toEqual(['Santo Niño']);
    expect(filterBarangays('niño').map((b) => b.name)).toContain('Santo Niño');
  });

  it('returns nothing for an unknown name', () => {
    expect(filterBarangays('zzzz')).toEqual([]);
  });
});

describe('barangayCoords', () => {
  it('finds coordinates by exact name, ignoring case, and null for unknown', () => {
    const c = barangayCoords('tumaga');
    expect(c).not.toBeNull();
    expect(c!.lat).toBeCloseTo(6.94, 1);
    expect(c!.lng).toBeCloseTo(122.08, 1);
    expect(barangayCoords('Nowhere')).toBeNull();
  });

  it('still understands the old spellings saved by earlier versions', () => {
    expect(barangayCoords('Sta. Maria')).toEqual(barangayCoords('Santa Maria'));
    expect(barangayCoords('Zone IV')).toEqual(barangayCoords('Zone IV (Poblacion)'));
    expect(barangayCoords('Sinunuc')).toEqual(barangayCoords('Sinunoc'));
    expect(barangayCoords('Sta. Maria')).not.toBeNull();
  });
});

describe('normalizeBarangayName', () => {
  it('turns an old spelling into the official one and leaves others alone', () => {
    expect(normalizeBarangayName('Sta. Maria')).toBe('Santa Maria');
    expect(normalizeBarangayName('Tumaga')).toBe('Tumaga');
  });
});
