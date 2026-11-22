import { BadgeCheck, BellRing, MapPin, MessagesSquare, TrendingUp, Truck } from 'lucide-react';
import { useId, useRef, useState, type ComponentType, type KeyboardEvent } from 'react';
import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { PhoneFrame } from './PhoneFrame';
import { AlertsScreen } from './screens/AlertsScreen';
import { MapScreen } from './screens/MapScreen';
import { OfferChatScreen } from './screens/OfferChatScreen';
import { OrderScreen } from './screens/OrderScreen';
import { PriceGuideScreen } from './screens/PriceGuideScreen';
import { VerifiedScreen } from './screens/VerifiedScreen';

export const FEATURE_IDS = ['offers', 'verified', 'price', 'alerts', 'map', 'orders'] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

const ICONS = { offers: MessagesSquare, verified: BadgeCheck, price: TrendingUp, alerts: BellRing, map: MapPin, orders: Truck } as const;
const SCREENS: Record<FeatureId, ComponentType> = {
  offers: OfferChatScreen,
  verified: VerifiedScreen,
  price: PriceGuideScreen,
  alerts: AlertsScreen,
  map: MapScreen,
  orders: OrderScreen,
};

/** The centerpiece: six feature tabs; the phone beside them shows the matching, clickable app screen. */
export function Features() {
  const { t } = useI18n();
  const uid = useId();
  const [index, setIndex] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = FEATURE_IDS[index];
  const Screen = SCREENS[active];

  function select(next: number, focus: boolean) {
    setIndex(next);
    if (focus) {
      const el = refs.current[next];
      el?.focus();
      if (typeof el?.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const n = FEATURE_IDS.length;
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index + n - 1) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    select(next, true);
  }

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Eyebrow>{t('features.eyebrow')}</Eyebrow>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <h2 className="m-0 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">{t('features.title')}</h2>
          <p className="m-0 text-base leading-relaxed text-muted">{t('features.blurb')}</p>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-24">
          <div className="min-w-0">
            <div
              role="tablist"
              aria-label={t('features.eyebrow')}
              onKeyDown={onKeyDown}
              className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {FEATURE_IDS.map((id, i) => {
                const Icon = ICONS[id];
                const selected = i === index;
                return (
                  <button
                    key={id}
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${id}`}
                    aria-selected={selected}
                    aria-controls={`${uid}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(i, false)}
                    className={`inline-flex min-h-12 shrink-0 snap-start items-center gap-3 rounded-2xl border px-4 py-3 text-left transition lg:w-full ${
                      selected ? 'border-eyebrow/60 bg-surface' : 'border-border bg-card hover:border-eyebrow/40'
                    }`}
                  >
                    <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${selected ? 'bg-primary text-primary-text' : 'bg-surface text-eyebrow'}`}>
                      <Icon size={18} />
                    </span>
                    <span className="flex flex-col">
                      <span className="whitespace-nowrap text-sm font-semibold text-text lg:whitespace-normal">{t(`features.${id}.title`)}</span>
                      <span className="hidden text-xs leading-snug text-muted lg:block">{t(`features.${id}.desc`)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted lg:hidden">{t(`features.${active}.desc`)}</p>
          </div>

          <div className="relative">
            <span aria-hidden className="absolute inset-x-6 top-1/2 h-72 -translate-y-1/2 rounded-full bg-section-green opacity-80 blur-3xl" />
            <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active}`} className="relative">
              <PhoneFrame label={t(`features.${active}.title`)}>
                <Screen key={active} />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
