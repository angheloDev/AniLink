import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';

const ITEMS = ['what', 'sell', 'offers', 'verified', 'payments', 'platforms', 'languages'] as const;

/** FAQ accordion: one answer open at a time, each trigger a real button with aria-expanded. */
export function Faq() {
  const { t } = useI18n();
  const uid = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <Eyebrow>{t('faq.eyebrow')}</Eyebrow>
          <h2 className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl">{t('faq.title')}</h2>
        </div>
        <div>
          {ITEMS.map((id, i) => {
            const isOpen = open === i;
            return (
              <div key={id} className="border-t border-border last:border-b">
                <h3 className="m-0">
                  <button
                    type="button"
                    id={`${uid}-q-${id}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a-${id}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-text"
                  >
                    {t(`faq.${id}.q`)}
                    <Plus size={20} aria-hidden className={`shrink-0 text-eyebrow transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <div id={`${uid}-a-${id}`} role="region" aria-labelledby={`${uid}-q-${id}`} hidden={!isOpen}>
                  <p className="m-0 pb-5 pr-8 text-sm leading-relaxed text-muted">{t(`faq.${id}.a`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
