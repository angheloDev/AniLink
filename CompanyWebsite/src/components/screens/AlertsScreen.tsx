import { Bell, BellRing } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { useStepper } from '../../lib/stepper';
import { useFocusResetWhenDone } from '../../lib/useFocusResetWhenDone';
import { Photo } from '../Photo';

/** Harvest alerts demo: set "mango ≤ ₱150", a farmer posts a listing, a notification pops. */
export function AlertsScreen() {
  const { t } = useI18n();
  const { step, busy, advance, reset } = useStepper(2);
  const label = step === 0 ? t('alerts.setBtn') : step === 1 ? t('alerts.farmerBtn') : null;
  const resetRef = useFocusResetWhenDone<HTMLButtonElement>(label === null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <h3 className="m-0 font-display text-2xl text-headline">{t('alerts.title')}</h3>

      <div className="rounded-2xl bg-card p-3">
        {step === 0 ? (
          <p className="m-0 flex items-center gap-2 text-[11px] text-muted">
            <Bell size={15} aria-hidden /> {t('alerts.hint')}
          </p>
        ) : (
          <p className="m-0 flex items-center gap-2 text-xs font-semibold text-eyebrow">
            <BellRing size={15} className="bell-ring" aria-hidden /> <span>{t('alerts.active')}</span>
          </p>
        )}
      </div>

      {step >= 2 && (
        <>
          <div className="pop-in rounded-2xl bg-tint-banana p-3">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t('alerts.posted')}</p>
            <p className="m-0 mt-1 flex items-center gap-2 text-sm font-semibold">
              <Photo id="mango" eager className="size-8 shrink-0 rounded-lg" />
              <span>
                {t('offer.listing')} · ₱140/kg
              </span>
            </p>
          </div>
          <div role="status" className="pop-in flex items-start gap-2 rounded-2xl border border-border bg-surface p-3 shadow-lg [--d:200ms]">
            <img src="/logos/mark.png" alt="" aria-hidden width={28} height={28} className="mt-0.5 size-7 rounded-lg" />
            <div className="min-w-0 leading-tight">
              <p className="m-0 flex items-center justify-between gap-2 text-[11px] font-semibold">
                <span>{t('alerts.notifTitle')}</span>
                <span className="text-[10px] font-normal text-muted">{t('alerts.now')}</span>
              </p>
              <p className="m-0 mt-1 text-[11px] text-muted">{t('alerts.notifBody')}</p>
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex flex-col gap-1 pt-2">
        {label && (
          <button
            type="button"
            data-testid="step-action"
            aria-disabled={busy}
            aria-busy={busy}
            onClick={advance}
            className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-text transition hover:brightness-110 aria-disabled:cursor-wait aria-disabled:opacity-60"
          >
            {label}
          </button>
        )}
        {step > 0 && (
          <button ref={resetRef} type="button" onClick={reset} className="min-h-11 text-[11px] font-medium text-muted underline-offset-4 hover:text-text hover:underline">
            {t('offer.reset')}
          </button>
        )}
      </div>
    </div>
  );
}
