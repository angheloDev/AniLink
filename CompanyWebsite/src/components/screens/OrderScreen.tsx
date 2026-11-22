import { Check } from 'lucide-react';
import { useState } from 'react';
import { formatPeso } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { OFFER } from '../../lib/offerDemo';
import { useStepper } from '../../lib/stepper';
import { useFocusResetWhenDone } from '../../lib/useFocusResetWhenDone';

export const ORDER_STEPS = ['paid', 'preparing', 'delivery', 'completed'] as const;
const PAY = ['ewallet', 'bank', 'cash'] as const;
type Pay = (typeof PAY)[number];

/** Order tracking + payment demo. Payments are generic (no real wallet brands) and clearly a demo. */
export function OrderScreen() {
  const { t } = useI18n();
  const { step, busy, advance, reset } = useStepper(ORDER_STEPS.length);
  const [pay, setPay] = useState<Pay>('ewallet');
  const btn = (['order.btnPay', 'order.btnPreparing', 'order.btnDelivery', 'order.btnCompleted'] as const)[step];
  const resetRef = useFocusResetWhenDone<HTMLButtonElement>(btn === undefined);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div>
        <h3 className="m-0 font-display text-2xl text-headline">{t('order.title')}</h3>
        <p className="m-0 mt-1 text-[11px] text-muted">
          {t('offer.listing')} · {OFFER.qty} kg · {formatPeso(OFFER.counterPrice * OFFER.qty)}
        </p>
      </div>

      <div>
        <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-eyebrow">{t('order.pay')}</p>
        <div className="flex flex-wrap gap-1.5">
          {PAY.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={pay === p}
              disabled={step > 0}
              onClick={() => setPay(p)}
              className={`min-h-11 rounded-full border px-3 text-[11px] font-medium transition ${
                pay === p ? 'border-primary bg-primary text-primary-text' : 'border-border text-muted hover:text-text'
              }`}
            >
              {t(`order.${p}`)}
            </button>
          ))}
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {ORDER_STEPS.map((id, i) => {
          const done = i < step;
          return (
            <li key={id} data-step={id} data-state={done ? 'done' : 'todo'} aria-current={i === step ? 'step' : undefined} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={`grid size-6 place-items-center rounded-full border-2 ${
                    done ? 'pop-in border-eyebrow bg-eyebrow text-bg' : i === step ? 'border-accent text-accent' : 'border-border text-transparent'
                  }`}
                >
                  <Check size={12} />
                </span>
                {i < ORDER_STEPS.length - 1 && <span aria-hidden className={`h-6 w-0.5 transition-colors duration-500 ${done ? 'bg-eyebrow' : 'bg-border'}`} />}
              </div>
              <p className={`m-0 pt-0.5 text-xs ${done ? 'font-semibold text-text' : 'text-muted'}`}>{t(`order.step.${id}`)}</p>
            </li>
          );
        })}
      </ol>

      <p className="m-0 text-[10px] text-muted">{t('order.demoNote')}</p>

      <div className="mt-auto flex flex-col gap-1">
        {btn && (
          <button
            type="button"
            data-testid="step-action"
            aria-disabled={busy}
            aria-busy={busy}
            onClick={advance}
            className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-text transition hover:brightness-110 aria-disabled:cursor-wait aria-disabled:opacity-60"
          >
            {t(btn)}
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
