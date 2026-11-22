import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

const ITEMS = ['what', 'sell', 'offers', 'verified', 'payments', 'platforms', 'languages'] as const;

/**
 * FAQ accordion: one answer open at a time, each trigger a real button with aria-expanded.
 * A closed panel is `visibility: hidden` (so it is out of the tab order and the accessibility tree) while the height
 * animation in motion.css plays; the inline style is what keeps that true even before the stylesheet loads.
 */
export function Faq() {
  const { t } = useI18n();
  const uid = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <Eyebrow>{t('faq.eyebrow')}</Eyebrow>
          <Reveal as="h2" delay={90} className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl">
            {t('faq.title')}
          </Reveal>
        </div>
        <div>
          {ITEMS.map((id, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={id} delay={i * 70} className="border-t border-border last:border-b">
                <h3 className="m-0">
                  <button
                    type="button"
                    id={`${uid}-q-${id}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a-${id}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={`group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-base font-medium transition-colors duration-300 hover:text-headline ${
                      isOpen ? 'text-headline' : 'text-text'
                    }`}
                  >
                    {t(`faq.${id}.q`)}
                    <span
                      aria-hidden
                      className={`grid size-8 shrink-0 place-items-center rounded-full border transition duration-300 ${
                        isOpen ? 'rotate-45 border-eyebrow bg-eyebrow/15' : 'border-transparent group-hover:border-border'
                      }`}
                    >
                      <Plus size={18} className="text-eyebrow" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${uid}-a-${id}`}
                  role="region"
                  aria-labelledby={`${uid}-q-${id}`}
                  data-open={isOpen}
                  className="faq-panel"
                  style={{ visibility: isOpen ? 'visible' : 'hidden' }}
                >
                  <div>
                    <p className="m-0 pb-5 pr-12 text-sm leading-relaxed text-muted">{t(`faq.${id}.a`)}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
