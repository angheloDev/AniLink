import { ChevronRight, HeartHandshake, MapPinned, ShieldCheck } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';

const VALUES = [
  { id: 'fair', Icon: HeartHandshake, tile: 'bg-tint-tomato text-accent' },
  { id: 'trust', Icon: ShieldCheck, tile: 'bg-tint-leafy text-eyebrow' },
  { id: 'local', Icon: MapPinned, tile: 'bg-tint-banana text-sun-text' },
] as const;
const TEAM = [1, 2, 3] as const;

const Placeholder = ({ label }: { label: string }) => (
  <span className="inline-block rounded-full bg-sun/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sun-text">{label}</span>
);

/** About: mission, three values and team cards. The mission copy and the team are placeholders until the owner fills them in. */
export function About() {
  const { t } = useI18n();
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>{t('about.eyebrow')}</Eyebrow>
            <h2 className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">{t('about.title')}</h2>
          </div>
          <div>
            <Placeholder label={t('about.placeholder')} />
            <p className="mb-0 mt-3 text-base leading-relaxed text-muted">{t('about.mission')}</p>
          </div>
        </div>

        <ul className="m-0 mt-12 grid list-none gap-4 p-0 md:grid-cols-3">
          {VALUES.map(({ id, Icon, tile }) => (
            <li key={id} data-testid="value-card" className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
              <span aria-hidden className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tile}`}>
                <Icon size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="m-0 text-base font-semibold text-text">{t(`about.${id}.title`)}</h3>
                <p className="m-0 mt-1 text-xs leading-relaxed text-muted">{t(`about.${id}.desc`)}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
            </li>
          ))}
        </ul>

        <h3 className="mb-0 mt-16 text-xs font-semibold uppercase tracking-[0.22em] text-eyebrow">{t('about.teamTitle')}</h3>
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
          {TEAM.map((n) => (
            <li key={n} data-testid="team-card" className="flex items-center gap-4 rounded-3xl bg-surface p-5">
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-primary font-display text-xl text-primary-text">
                {String.fromCharCode(64 + n)}
              </span>
              <div>
                <p className="m-0 text-sm font-semibold">{t('about.teamName', { n })}</p>
                <p className="mb-1.5 mt-0 text-xs text-muted">{t('about.teamRole')}</p>
                <Placeholder label={t('about.placeholder')} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
