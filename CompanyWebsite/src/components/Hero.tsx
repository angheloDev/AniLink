import { BadgeCheck, Sun, Tag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { formatPeso } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { initialOfferDemo, OFFER, offerDemoReducer } from '../lib/offerDemo';
import { useReducedMotion } from '../lib/reducedMotion';
import { useCycle } from '../lib/useCycle';
import { Eyebrow } from './Eyebrow';
import { PhoneFrame } from './PhoneFrame';
import { Reveal } from './Reveal';
import { HomeScreen } from './screens/HomeScreen';
import { ListingScreen } from './screens/ListingScreen';
import { OfferChatScreen } from './screens/OfferChatScreen';
import { StoreButton } from './StoreButton';
import { SunDecor } from './SunDecor';

/** How long each app screen stays on the hero phone. */
export const HERO_CYCLE_MS = 4000;

const COUNTERED = offerDemoReducer(offerDemoReducer(initialOfferDemo, { type: 'propose' }), { type: 'counter' });
const CHIPS = ['hero.chip1', 'hero.chip2', 'hero.chip3'] as const;

export function Hero() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const screen = useCycle(3, HERO_CYCLE_MS, !reduced);
  const ref = useRef<HTMLElement>(null);

  // Light parallax for the floating cards. Skipped entirely when the visitor prefers less motion.
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        el?.style.setProperty('--py', String(Math.min(window.scrollY, 800)));
        queued = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  const fade = 'h-full motion-safe:animate-[fade-in_0.5s_ease-out]';

  return (
    <section id="top" ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <Reveal as="p" delay={100} className="mb-0 mt-5 inline-flex items-center gap-2 rounded-full bg-tint-banana px-3.5 py-2 text-xs font-semibold text-sun-text">
            <Sun size={14} aria-hidden /> {t('hero.badge')}
          </Reveal>
          <Reveal as="h1" delay={180} className="mb-0 mt-6 font-display text-[clamp(3.25rem,9vw,6rem)] leading-[0.96] tracking-tight">
            <span className="block text-headline">{t('hero.headline1')}</span>
            <span className="block italic text-accent">{t('hero.headline2')}</span>
          </Reveal>
          <Reveal as="p" delay={260} className="mb-0 mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {t('hero.subtitle')}
          </Reveal>
          <Reveal delay={340} className="mt-8 flex flex-wrap gap-3">
            <StoreButton store="google" />
            <StoreButton store="apple" />
          </Reveal>
          <Reveal as="ul" delay={420} className="m-0 mt-8 flex list-none flex-wrap gap-2 p-0">
            {CHIPS.map((k) => (
              <li key={k} className="rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted transition duration-300 motion-safe:hover:-translate-y-0.5 hover:border-eyebrow/50 hover:text-text">
                {t(k)}
              </li>
            ))}
          </Reveal>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          <SunDecor className="-right-4 top-2 z-0 size-28 sm:-right-10 sm:size-40" />
          <Reveal delay={150} className="relative z-10 h-[560px] overflow-hidden rounded-b-[2.5rem] rounded-t-[999px] bg-section-green sm:h-[620px]">
            <span aria-hidden className="absolute -left-20 top-1/3 size-72 rounded-full border border-eyebrow/15" />
            <span aria-hidden className="absolute -right-24 top-24 size-80 rounded-full border border-eyebrow/10" />
            <div className="phone-rise absolute bottom-[-80px] left-1/2 w-[min(260px,80%)] -translate-x-1/2">
              <PhoneFrame label={t('hero.phoneLabel')}>
                {screen === 0 && (
                  <div data-testid="screen-home" className={fade}>
                    <HomeScreen />
                  </div>
                )}
                {screen === 1 && (
                  <div data-testid="screen-listing" className={fade}>
                    <ListingScreen />
                  </div>
                )}
                {screen === 2 && (
                  <div data-testid="screen-chat" className={fade}>
                    <OfferChatScreen initial={COUNTERED} interactive={false} />
                  </div>
                )}
              </PhoneFrame>
            </div>
          </Reveal>

          <div
            className="absolute left-0 top-[22%] z-20 flex items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:-left-8 float-a"
            style={{ translate: '0 calc(var(--py, 0) * -0.05px)' }}
          >
            <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary text-primary-text">
              <Tag size={18} />
            </span>
            <div className="leading-tight">
              <p className="m-0 text-[11px] text-muted">{t('offer.cardCounter')}</p>
              <p className="m-0 font-display text-xl text-headline">
                {formatPeso(OFFER.counterPrice)}
                <span className="ml-1 font-sans text-[11px] text-muted">/kg</span>
              </p>
            </div>
          </div>

          <div
            className="absolute bottom-[16%] right-0 z-20 flex items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur sm:-right-6 float-b"
            style={{ translate: '0 calc(var(--py, 0) * 0.04px)' }}
          >
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-eyebrow/20 text-eyebrow">
              <BadgeCheck size={20} />
            </span>
            <div className="leading-tight">
              <p className="m-0 text-xs font-semibold">{t('verified.badge')}</p>
              <p className="m-0 text-[11px] text-muted">{t('verified.place')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
