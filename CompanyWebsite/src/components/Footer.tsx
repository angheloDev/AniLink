import { Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Logo } from './Logo';
import { Modal } from './Modal';
import { NAV_LINKS } from './Nav';

type Legal = 'privacy' | 'terms' | null;

export function Footer() {
  const { t } = useI18n();
  const [legal, setLegal] = useState<Legal>(null);

  return (
    <footer className="on-green bg-deep-green text-text">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Logo variant="lockup" />
          <p className="max-w-xs text-sm text-muted">{t('footer.tagline')}</p>
          <div className="flex gap-2" aria-hidden>
            {[Globe, MessageCircle, Send].map((Icon, i) => (
              <span key={i} className="grid size-10 place-items-center rounded-full border border-border text-muted">
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-eyebrow">{t('footer.explore')}</h2>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-11 items-center text-sm text-muted transition hover:text-text">
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-eyebrow">{t('footer.contact')}</h2>
          <p className="mb-3 inline-block rounded-full bg-sun/15 px-3 py-1 text-[11px] font-medium text-sun-text">{t('footer.placeholderTag')}</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Mail size={15} aria-hidden /> hello@anilink.example
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} aria-hidden /> +63 900 000 0000
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} aria-hidden /> {t('footer.address')}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-5 text-xs text-muted sm:px-8">
          <p className="m-0">{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLegal('privacy')} className="min-h-11 px-3 hover:text-text">
              {t('footer.privacy')}
            </button>
            <button type="button" onClick={() => setLegal('terms')} className="min-h-11 px-3 hover:text-text">
              {t('footer.terms')}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={legal !== null}
        onClose={() => setLegal(null)}
        title={legal === 'terms' ? t('legal.termsTitle') : t('legal.privacyTitle')}
      >
        <p className="mb-6 text-sm text-muted">{legal === 'terms' ? t('legal.termsBody') : t('legal.privacyBody')}</p>
        <button
          type="button"
          onClick={() => setLegal(null)}
          className="min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-text"
        >
          {t('store.close')}
        </button>
      </Modal>
    </footer>
  );
}
