import { Search } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import type { PhotoId } from '../../lib/photos';
import { Photo } from '../Photo';

const CHIPS = ['fruits', 'vegetables', 'leafy', 'rootcrops'] as const;
const FRESH: { photo: PhotoId; name: string; price: string; tint: string }[] = [
  { photo: 'mango', name: 'Carabao Mangoes', price: '₱130/kg', tint: 'bg-tint-banana' },
  { photo: 'tomato', name: 'Tomatoes', price: '₱82/kg', tint: 'bg-tint-tomato' },
];

/** A static buyer-home screen for the hero phone. */
export function HomeScreen() {
  const { t } = useI18n();
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden px-4 pt-1">
      <div>
        <p className="m-0 font-display text-2xl text-headline">{t('home.greeting')}</p>
        <p className="m-0 text-[11px] text-muted">{t('home.sub')}</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[11px] text-muted">
        <Search size={13} aria-hidden /> {t('home.search')}
      </div>
      <div className="flex gap-1.5 overflow-hidden">
        {CHIPS.map((c, i) => (
          <span key={c} className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${i === 0 ? 'border-primary bg-primary text-primary-text' : 'border-border text-muted'}`}>
            {t(`cat.${c}`)}
          </span>
        ))}
      </div>
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-eyebrow">{t('home.fresh')}</p>
      <div className="grid grid-cols-2 gap-2">
        {FRESH.map((f) => (
          <div key={f.name} className="overflow-hidden rounded-2xl bg-card">
            <div className={`h-20 ${f.tint}`}>
              <Photo id={f.photo} eager className="size-full" />
            </div>
            <div className="p-2">
              <p className="m-0 truncate text-[11px] font-semibold">{f.name}</p>
              <p className="m-0 font-display text-lg leading-tight text-headline">{f.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
