import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { tl } from './tl';

export type Language = 'en' | 'tl';
export const LANG_KEY = 'anilink.lang';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, tl: { translation: tl } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Reads the saved language (English by default, never the device locale) and applies it. */
export async function loadLanguage(): Promise<Language> {
  let lang: Language = 'en';
  try {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved === 'tl' || saved === 'en') lang = saved;
  } catch {
    /* storage unavailable */
  }
  await i18n.changeLanguage(lang);
  return lang;
}

export async function setLanguage(lang: Language): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

export default i18n;
