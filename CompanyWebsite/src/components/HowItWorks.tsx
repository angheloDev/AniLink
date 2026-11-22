import { BadgeCheck, MessagesSquare, PackageCheck, Search, Sprout, Star, Tag, Truck } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

type Audience = 'buyers' | 'farmers';
const STEPS = [1, 2, 3, 4] as const;
const ICONS = {
  buyers: [Search, MessagesSquare, Truck, Star],
  farmers: [Sprout, BadgeCheck, Tag, PackageCheck],
} as const;

/** The dark-green "how it works" band with four steps and a buyers / farmers toggle. */
export function HowItWorks() {
  const { t } = useI18n();
  const [who, setWho] = useState<Audience>('buyers');

  const toggle = (id: Audience, label: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={who === id}
      onClick={() => setWho(id)}
      className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition ${
        who === id ? 'border-headline bg-headline text-deep-green' : 'border-eyebrow/40 text-text hover:border-eyebrow'
      }`}
    >
      {label}
    </button>
  );

  return (
    <section id="how" className="on-green relative overflow-hidden bg-section-green py-20 sm:py-28">
      <span aria-hidden className="absolute -left-48 -top-48 size-[34rem] rounded-full border border-eyebrow/10" />
      <span aria-hidden className="absolute -left-24 -top-24 size-[22rem] rounded-full border border-eyebrow/10" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <Eyebrow>{t('how.eyebrow')}</Eyebrow>
          <Reveal as="h2" delay={90} className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">
            {t('how.title')}
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {toggle('buyers', t('how.forBuyers'))}
            {toggle('farmers', t('how.forFarmers'))}
          </div>
        </div>

        <ol className="m-0 list-none p-0">
          {STEPS.map((n, i) => {
            const Icon = ICONS[who][i];
            return (
              <Reveal as="li" key={`${who}-${n}`} delay={i * 90} className="group grid grid-cols-[auto_1fr] items-start gap-4 border-t border-eyebrow/20 py-6 transition duration-300 last:border-b motion-safe:hover:translate-x-1 hover:border-eyebrow/50 sm:gap-6">
                <span aria-hidden className="grid size-12 place-items-center rounded-full bg-black/20 text-headline transition duration-300 group-hover:scale-110 group-hover:bg-eyebrow/25">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="m-0 text-lg font-semibold text-text">{t(`how.${who}.${n}.title`)}</h3>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-text/80">{t(`how.${who}.${n}.desc`)}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
