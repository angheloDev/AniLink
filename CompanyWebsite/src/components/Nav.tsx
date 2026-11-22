import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../lib/i18n';
import { useScrolled } from '../lib/scroll';
import { useStore } from '../lib/store';
import { LanguageToggle } from './LanguageToggle';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export const NAV_LINKS = [
  { href: '#features', key: 'nav.features' },
  { href: '#how', key: 'nav.how' },
  { href: '#about', key: 'nav.about' },
  { href: '#faq', key: 'nav.faq' },
] as const;

const CTA = 'shine glint inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm xl:px-6 font-semibold text-primary-text transition hover:brightness-110';

export function Nav() {
  const { t } = useI18n();
  const { open: openStore } = useStore();
  const [menu, setMenu] = useState(false);
  const scrolled = useScrolled();
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    document.addEventListener('keydown', onKey);
    // The menu and its button are hidden from lg up; if the window grows past that (e.g. a tablet
    // rotating) close the menu so page scrolling is never left locked with no way to close it.
    const desktop = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1024px)') : null;
    const onWide = (e: { matches: boolean }) => {
      if (e.matches) setMenu(false);
    };
    desktop?.addEventListener('change', onWide);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      desktop?.removeEventListener('change', onWide);
      document.documentElement.style.overflow = prev;
    };
  }, [menu]);

  return (
    <>
      <header
        data-scrolled={scrolled ? 'true' : 'false'}
        className="group sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md transition-shadow duration-300 data-[scrolled=true]:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)]"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 motion-safe:transition-[height] motion-safe:duration-300 group-data-[scrolled=true]:h-16 sm:px-8">
          <a href="#top" className="rounded-full" onClick={() => setMenu(false)}>
            <Logo variant="lockup" />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-9">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link whitespace-nowrap text-sm font-medium text-muted transition hover:text-text">
                {t(l.key)}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <button type="button" className={`${CTA} whitespace-nowrap`} onClick={() => openStore('google')}>
              {t('nav.getApp')}
            </button>
          </div>

          <button
            ref={burger}
            type="button"
            aria-label={menu ? t('nav.closeMenu') : t('nav.menu')}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text lg:hidden"
          >
            <span key={String(menu)} className="icon-swap grid place-items-center">
              {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </span>
          </button>
        </div>
      </header>

      {menu && (
        <div id="mobile-menu" data-testid="mobile-menu" className="fade-fast fixed inset-0 z-40 flex flex-col gap-8 overflow-y-auto bg-bg px-6 pb-10 pt-28 lg:hidden">
          <nav aria-label="Mobile">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {NAV_LINKS.map((l, i) => (
                <li key={l.href} className="stagger-in" style={{ '--i': i } as CSSProperties}>
                  <a
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="block border-b border-border py-4 font-display text-4xl text-headline"
                  >
                    {t(l.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <button
              type="button"
              className={`${CTA} min-h-14 w-full text-base`}
              onClick={() => {
                burger.current?.focus(); // the clicked button is about to unmount; give focus a home to return to
                setMenu(false);
                openStore('google');
              }}
            >
              {t('nav.getApp')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
