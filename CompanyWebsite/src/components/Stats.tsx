import { STATS } from '../content/stats';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { SunDecor } from './SunDecor';

/** The rounded stat panel with the sun corner. Only true facts: see content/stats.ts. */
export function Stats() {
  const { t } = useI18n();
  const tiles = [
    { value: String(STATS.barangays), label: t('stats.barangays') },
    { value: String(STATS.categories), label: t('stats.categories') },
    { value: String(STATS.languages), label: t('stats.languages') },
    { value: '1', label: t('stats.chat') },
  ];
  return (
    <section id="stats" aria-label={t('stats.title')} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-surface p-6 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:p-16">
          <SunDecor className="-right-12 -top-12 size-44 bg-mustard" />
          <div className="relative">
            <Eyebrow>{t('stats.eyebrow')}</Eyebrow>
            <h2 className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl">{t('stats.title')}</h2>
            <p className="mb-0 mt-5 max-w-md text-base leading-relaxed text-muted">{t('stats.body')}</p>
          </div>
          <dl className="relative m-0 mt-10 grid grid-cols-2 lg:mt-0">
            {tiles.map((s, i) => (
              <div key={s.label} className={`flex min-w-0 flex-col gap-2 p-3 sm:p-7 ${i % 2 === 1 ? 'border-l border-border' : ''} ${i > 1 ? 'border-t border-border' : ''}`}>
                <dd className="m-0 font-display text-5xl leading-none text-headline sm:text-6xl">{s.value}</dd>
                <dt className="break-words text-[10px] font-medium uppercase tracking-[0.1em] text-muted sm:text-[11px] sm:tracking-[0.16em]">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
