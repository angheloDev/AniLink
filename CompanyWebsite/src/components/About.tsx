import { ChevronRight, HeartHandshake, MapPinned, ShieldCheck } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

const VALUES = [
  { id: 'fair', Icon: HeartHandshake, tile: 'bg-tint-tomato text-accent' },
  { id: 'trust', Icon: ShieldCheck, tile: 'bg-tint-leafy text-eyebrow' },
  { id: 'local', Icon: MapPinned, tile: 'bg-tint-banana text-sun-text' },
] as const;

const Placeholder = ({ label }: { label: string }) => (
  <span className="inline-block rounded-full bg-sun/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sun-text">{label}</span>
);

/** About: mission and three values. The mission copy is a placeholder until the owner fills it in. The team cards were removed for now (see git history). */
export function About() {
  const { t } = useI18n();
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>{t('about.eyebrow')}</Eyebrow>
            <Reveal as="h2" delay={90} className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">
              {t('about.title')}
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Placeholder label={t('about.placeholder')} />
            <p className="mb-0 mt-3 text-base leading-relaxed text-muted">{t('about.mission')}</p>
          </Reveal>
        </div>

        <ul className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
          {VALUES.map(({ id, Icon, tile }, i) => (
            <Reveal
              as="li"
              key={id}
              delay={i * 100}
              data-testid="value-card"
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition duration-300 motion-safe:hover:-translate-y-1 hover:border-eyebrow/50 hover:shadow-xl hover:shadow-black/20"
            >
              <span aria-hidden className={`grid size-14 shrink-0 place-items-center rounded-2xl transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${tile}`}>
                <Icon size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-base font-semibold text-text">{t(`about.${id}.title`)}</h3>
                <p className="m-0 mt-1 text-xs leading-relaxed text-muted">{t(`about.${id}.desc`)}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
