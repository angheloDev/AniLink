import { Play, Smartphone } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useStore, type StoreId } from '../lib/store';

/** A plain store-style button (deliberately not the official badge artwork). */
export function StoreButton({ store, className = '' }: { store: StoreId; className?: string }) {
  const { t } = useI18n();
  const { open } = useStore();
  const google = store === 'google';
  return (
    <button
      type="button"
      onClick={() => open(store)}
      className={`shine inline-flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-5 text-left text-text transition hover:border-eyebrow hover:shadow-xl hover:shadow-black/20 motion-safe:hover:-translate-y-0.5 ${className}`}
    >
      {google ? <Play size={26} className="fill-eyebrow text-eyebrow" aria-hidden /> : <Smartphone size={26} className="text-accent" aria-hidden />}
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{t(google ? 'store.googleKicker' : 'store.appleKicker')}</span>
        <span className="text-base font-semibold">{t(google ? 'store.google' : 'store.apple')}</span>
      </span>
    </button>
  );
}
