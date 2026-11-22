import { describe, expect, it } from 'vitest';
import { BARANGAYS, barangayCoords } from '../src/services/geo';

describe('barangay geo lookup', () => {
  it('knows all 98 official barangays of Zamboanga City', () => {
    expect(BARANGAYS).toHaveLength(98);
  });

  it('finds old spellings saved by earlier versions of the app', () => {
    expect(barangayCoords('Sta. Maria')).toEqual(barangayCoords('Santa Maria'));
    expect(barangayCoords('Zone IV')).toEqual(barangayCoords('Zone IV (Poblacion)'));
    expect(barangayCoords('Sinunuc')).toEqual(barangayCoords('Sinunoc'));
    expect(barangayCoords('Sta. Maria')).not.toBeNull();
  });

  it('returns null for a barangay that does not exist', () => {
    expect(barangayCoords('Nowhere')).toBeNull();
  });
});
