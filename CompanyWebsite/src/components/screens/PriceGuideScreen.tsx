import { useState } from 'react';
import { formatPeso } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { PRICE_GUIDE, sparklinePath, vsAverage } from '../../lib/priceGuide';
import { Photo } from '../Photo';

const pct = (v: number, lo: number, hi: number) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));

/** Price Guide screen: pick a crop, see low/avg/high, an 8-week trend and how a listing compares. */
export function PriceGuideScreen() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const c = PRICE_GUIDE[index];
  const cmp = vsAverage(c.listed, c.avg);
  const badge =
    cmp.label === 'below'
      ? t('price.badgeBelow', { amount: formatPeso(cmp.delta) })
      : cmp.label === 'above'
        ? t('price.badgeAbove', { amount: formatPeso(cmp.delta) })
        : t('price.badgeAt');
  const badgeStyle = cmp.label === 'below' ? 'bg-eyebrow/15 text-eyebrow' : cmp.label === 'above' ? 'bg-accent/15 text-accent-text' : 'bg-border text-muted';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div className="flex items-baseline justify-between">
        <h3 className="m-0 font-display text-2xl text-headline">{t('price.title')}</h3>
        <span className="rounded-full bg-sun/15 px-2 py-0.5 text-[10px] font-medium text-sun-text">{t('price.sample')}</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {PRICE_GUIDE.map((p, i) => (
          <button
            key={p.crop}
            type="button"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border px-3 text-[11px] font-medium transition ${
              i === index ? 'border-primary bg-primary text-primary-text' : 'border-border text-muted hover:text-text'
            }`}
          >
            <Photo id={p.photo} eager className="size-6 shrink-0 rounded-full" /> {p.crop}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-3">
        <p className="m-0 font-display text-3xl leading-none text-headline">
          {formatPeso(c.avg)}
          <span className="ml-1 font-sans text-[11px] text-muted">
            /kg · <span>{t('price.avg')}</span>
          </span>
        </p>
        <p key={c.crop} className={`pop-in m-0 mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyle}`}>
          {badge}
        </p>

        <div className="mt-4">
          <div className="relative h-2 rounded-full bg-border" aria-hidden>
            <span className="absolute inset-y-0 rounded-full bg-primary" style={{ left: 0, right: 0 }} />
            <span className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-bg bg-accent motion-safe:transition-[left] motion-safe:duration-700 motion-safe:ease-out" style={{ left: `${pct(c.listed, c.low, c.high)}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted">
            <span>
              {t('price.low')} <b className="text-text">{formatPeso(c.low)}</b>
            </span>
            <span>
              {t('price.high')} <b className="text-text">{formatPeso(c.high)}</b>
            </span>
          </div>
          <p className="m-0 mt-1 text-[10px] text-muted">{t('price.listed', { price: formatPeso(c.listed) })}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-3">
        <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-eyebrow">{t('price.trend')}</p>
        <svg key={c.crop} viewBox="0 0 200 60" preserveAspectRatio="none" className="wipe h-16 w-full" role="img" aria-label={t('price.trend')}>
          <path
            data-testid="sparkline"
            d={sparklinePath(c.weekly, 200, 60)}
            fill="none"
            stroke="var(--eyebrow)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
