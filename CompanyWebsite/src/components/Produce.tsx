import { ArrowRight, BadgeCheck, Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatPeso } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { filterProduce, PRODUCE, type ProduceCategory, type ProduceItem } from '../lib/produce';
import { useStore } from '../lib/store';
import { Eyebrow } from './Eyebrow';

const FILTERS = ['all', 'fruits', 'vegetables', 'leafy', 'rootcrops', 'crafts'] as const;
const TINT: Record<ProduceCategory, string> = {
  fruits: 'bg-tint-banana',
  vegetables: 'bg-tint-tomato',
  leafy: 'bg-tint-leafy',
  rootcrops: 'bg-tint-mango',
  crafts: 'bg-tint-mango',
};

function Card({ item, saved, onSave }: { item: ProduceItem; saved: boolean; onSave(): void }) {
  const { t } = useI18n();
  return (
    <li data-testid="produce-card" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className={`relative grid h-44 place-items-center sm:h-48 ${TINT[item.category]}`}>
        <span aria-hidden className="text-7xl drop-shadow-lg sm:text-8xl">
          {item.emoji}
        </span>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={t('produce.save', { name: item.name })}
          onClick={onSave}
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/60"
        >
          <Heart size={18} className={saved ? 'fill-accent text-accent' : ''} aria-hidden />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white">{t(`cat.${item.category}`)}</span>
      </div>
      <div className="p-5">
        <h3 className="m-0 text-lg font-medium text-text">{item.name}</h3>
        <p className="m-0 mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} aria-hidden /> {item.barangay}
        </p>
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-border pt-4">
          <p className="m-0 font-display text-3xl leading-none text-headline">
            {formatPeso(item.price)}
            <span className="ml-1 font-sans text-xs text-muted">/ {t(`unit.${item.unit}`)}</span>
          </p>
          {item.verified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-eyebrow">
              <BadgeCheck size={13} aria-hidden /> {t('produce.verified')}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/** "Fresh from the farm": category pills over tinted produce cards. All sample listings. */
export function Produce() {
  const { t } = useI18n();
  const { open } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [saved, setSaved] = useState<ReadonlySet<string>>(new Set());
  const items = filterProduce(PRODUCE, filter);

  const toggleSave = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <section id="produce" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Eyebrow>{t('produce.eyebrow')}</Eyebrow>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="m-0 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">{t('produce.title')}</h2>
            <p className="mb-0 mt-3 inline-block rounded-full bg-sun/15 px-3 py-1 text-xs font-medium text-sun-text">{t('produce.sample')}</p>
          </div>
          <button
            type="button"
            onClick={() => open('google')}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-headline transition hover:border-eyebrow"
          >
            {t('produce.viewAll')} <ArrowRight size={16} aria-hidden />
          </button>
        </div>

        <div role="group" aria-label={t('produce.filters')} className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-full border px-5 text-sm font-medium transition ${
                filter === f ? 'border-primary bg-primary text-primary-text' : 'border-border text-muted hover:text-text'
              }`}
            >
              {t(`cat.${f}`)}
            </button>
          ))}
        </div>

        <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} item={item} saved={saved.has(item.id)} onSave={() => toggleSave(item.id)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
