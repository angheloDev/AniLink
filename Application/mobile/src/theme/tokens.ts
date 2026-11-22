const dark = {
  bg: '#1F1E1B',
  surface: '#272622',
  card: '#161614',
  border: '#34322D',
  primary: '#1E4A3D',
  primaryText: '#C9E8D6',
  headline: '#BEE3CF',
  eyebrow: '#6FBF8E',
  accent: '#E8834A',
  sun: '#F0C04B',
  mustard: '#A8873A',
  text: '#ECE8E0',
  muted: '#9E998F',
  sectionGreen: '#1A3F36',
  deepGreen: '#0F2E28',
  tintTomato: '#4A2E28',
  tintBanana: '#3D2E14',
  tintLeafy: '#2E3D2E',
  tintMango: '#3D3608',
  danger: '#E0715F',
  success: '#6FBF8E',
  overlay: 'rgba(0,0,0,0.6)',
};

export type Colors = { [K in keyof typeof dark]: string };

const light: Colors = {
  bg: '#F6F3EC',
  surface: '#FFFFFF',
  card: '#FBF9F4',
  border: '#E3DED2',
  primary: '#1E5A45',
  primaryText: '#FFFFFF',
  headline: '#1B4D3E',
  eyebrow: '#2F7D55',
  accent: '#D9702F',
  sun: '#E7B13A',
  mustard: '#C79A33',
  text: '#1F1E1B',
  muted: '#6B675E',
  sectionGreen: '#DCEBDD',
  deepGreen: '#C9E0D0',
  tintTomato: '#F6DDD4',
  tintBanana: '#F5E8C2',
  tintLeafy: '#DCEBD5',
  tintMango: '#F4EEBA',
  danger: '#C8412F',
  success: '#2F7D55',
  overlay: 'rgba(31,30,27,0.45)',
};

export const tokens: { dark: Colors; light: Colors } = { dark, light };

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const radii = { card: 24, chip: 999, input: 16, button: 999, sheet: 28 } as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🍅',
  fruits: '🥭',
  leafy: '🥬',
  rootcrops: '🍠',
  grains: '🌾',
  crafts: '🧺',
  others: '🥥',
};

export function tintFor(c: Colors, category: string): string {
  switch (category) {
    case 'vegetables':
      return c.tintTomato;
    case 'fruits':
      return c.tintBanana;
    case 'leafy':
      return c.tintLeafy;
    case 'rootcrops':
    case 'grains':
      return c.tintMango;
    default:
      return c.surface;
  }
}
