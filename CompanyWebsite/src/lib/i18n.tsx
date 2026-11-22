import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey } from '../content/en';
import { tl } from '../content/tl';
import { safeGet, safeSet } from './storage';

export type Lang = 'en' | 'tl';
/** Every language the site offers (the language toggle and the stat tiles both read this). */
export const LANGUAGES: readonly Lang[] = ['en', 'tl'];
export const LANG_KEY = 'anilink.lang';

export function parseLang(raw: string | null): Lang {
  return raw === 'tl' ? 'tl' : 'en';
}

type Vars = Record<string, string | number>;

interface I18nValue {
  lang: Lang;
  setLang(l: Lang): void;
  t(key: MessageKey, vars?: Vars): string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => parseLang(safeGet(LANG_KEY)));

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    safeSet(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => {
      const raw: string = lang === 'tl' ? tl[key] : en[key];
      return vars ? raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m)) : raw;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
