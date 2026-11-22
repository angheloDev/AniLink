/**
 * Figures shown in the stat tiles. Every one must be true of the app; test/stats.test.ts checks them
 * against the app's own data (barangay list, categories) and the languages this site offers.
 */
export const STATS = { barangays: 98, categories: 7, languages: 2 } as const;
