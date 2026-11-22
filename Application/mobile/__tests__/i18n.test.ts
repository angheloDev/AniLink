import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { loadLanguage, setLanguage } from '../src/i18n';
import { en } from '../src/i18n/en';
import { tl } from '../src/i18n/tl';

type Tree = { [k: string]: string | Tree };
function flatten(o: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const placeholders = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort().join(',');

describe('translations', () => {
  const fe = flatten(en as Tree);
  const ft = flatten(tl as Tree);

  it('has identical key sets in English and Tagalog', () => {
    expect(Object.keys(ft).sort()).toEqual(Object.keys(fe).sort());
  });

  it('has no empty values', () => {
    const empty = [
      ...Object.entries(fe).filter(([, v]) => !v.trim()).map(([k]) => `en.${k}`),
      ...Object.entries(ft).filter(([, v]) => !v.trim()).map(([k]) => `tl.${k}`),
    ];
    expect(empty).toEqual([]);
  });

  it('uses the same interpolation placeholders in both languages', () => {
    const mismatched = Object.keys(fe).filter((k) => placeholders(ft[k]) !== placeholders(fe[k]));
    expect(mismatched).toEqual([]);
  });

  it('actually translates the common UI strings', () => {
    const same = ['common.retry', 'common.cancel', 'tabs.explore', 'auth.logIn', 'order.payNow'].filter((k) => ft[k] === fe[k]);
    expect(same).toEqual([]);
  });
});

describe('language switching', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('defaults to English', async () => {
    await loadLanguage();
    expect(i18n.language).toBe('en');
    expect(i18n.t('common.retry')).toBe(en.common.retry);
  });

  it('setLanguage switches strings and persists the choice', async () => {
    await setLanguage('tl');
    expect(i18n.t('common.retry')).toBe(tl.common.retry);
    expect(await AsyncStorage.getItem('anilink.lang')).toBe('tl');
  });

  it('restores the saved language', async () => {
    await AsyncStorage.setItem('anilink.lang', 'tl');
    await loadLanguage();
    expect(i18n.language).toBe('tl');
  });

  it('interpolates values', async () => {
    expect(i18n.t('home.greeting', { name: 'Carla' })).toContain('Carla');
  });
});
