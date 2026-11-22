import { BadgeCheck, Heart } from 'lucide-react';
import { formatPeso } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { PRICE_GUIDE, vsAverage } from '../../lib/priceGuide';
import { Photo } from '../Photo';

/** A static listing-detail screen for the hero phone (sample listing, price-guide badge, seller card). */
export function ListingScreen() {
  const { t } = useI18n();
  const mango = PRICE_GUIDE[0];
  const cmp = vsAverage(mango.listed, mango.avg);
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden px-4 pt-1">
      <div className="relative h-32 overflow-hidden rounded-2xl bg-tint-banana">
        <Photo id={mango.photo} eager className="size-full" />
        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/30 text-white">
          <Heart size={14} />
        </span>
      </div>
      <h3 className="m-0 text-sm font-semibold">{t('offer.listing')}</h3>
      <p className="m-0 font-display text-3xl leading-none text-headline">
        {formatPeso(mango.listed)}
        <span className="ml-1 font-sans text-xs text-muted">/kg</span>
      </p>
      <p className="m-0 inline-block self-start rounded-full bg-eyebrow/15 px-2.5 py-1 text-[10px] font-semibold text-eyebrow">
        {t('price.badgeBelow', { amount: formatPeso(cmp.delta) })}
      </p>
      <p className="m-0 text-[11px] text-muted">
        {t('listing.stock', { qty: 240 })} · {t('listing.fresh')}
      </p>
      <div className="flex items-center gap-2 rounded-2xl bg-card p-2">
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-text">
          BR
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="m-0 flex items-center gap-1 text-[11px] font-semibold">
            {t('offer.farmer')} <BadgeCheck size={12} className="text-eyebrow" aria-hidden />
          </p>
          <p className="m-0 text-[10px] text-muted">{t('offer.farmerPlace')}</p>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 pb-3">
        <span className="grid min-h-9 place-items-center rounded-full border border-border text-[11px] font-semibold">{t('listing.message')}</span>
        <span className="grid min-h-9 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-text">{t('listing.offer')}</span>
      </div>
    </div>
  );
}
