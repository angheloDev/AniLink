import { BadgeCheck, Check, ChevronLeft, Tag } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useFocusResetWhenDone } from '../../lib/useFocusResetWhenDone';
import { formatPeso } from '../../lib/format';
import { useI18n } from '../../lib/i18n';
import { Photo } from '../Photo';
import {
  initialOfferDemo,
  nextAction,
  OFFER,
  offerDemoReducer,
  type OfferDemoState,
  type OfferEvent,
} from '../../lib/offerDemo';

/** Pause after each click so the story can't be rushed or skipped by double-clicking. */
export const COOLDOWN_MS = 600;

function OfferCard({ event }: { event: OfferEvent }) {
  const { t } = useI18n();
  const mine = event.by === 'buyer';
  const label = event.kind === 'offer' ? t('offer.cardOffer') : event.kind === 'counter' ? t('offer.cardCounter') : t('offer.cardAccepted');
  return (
    <div
      className={`pop-in max-w-[86%] rounded-2xl border p-3 ${mine ? 'ml-auto border-primary bg-primary text-primary-text' : 'border-border bg-surface'}`}
    >
      <p className={`m-0 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${mine ? 'text-primary-text/80' : 'text-eyebrow'}`}>
        {event.kind === 'accept' && <Check size={12} aria-hidden />}
        <span>{label}</span>
      </p>
      <p className={`m-0 mt-1 font-display text-2xl leading-none ${mine ? 'text-primary-text' : 'text-headline'}`}>
        {formatPeso(event.price)}
        <span className={`ml-1 font-sans text-[11px] ${mine ? 'text-primary-text/80' : 'text-muted'}`}>
          /kg × {event.qty} kg
        </span>
      </p>
      <p className={`m-0 mt-1 text-[11px] ${mine ? 'text-primary-text/80' : 'text-muted'}`}>{t('offer.total', { amount: formatPeso(event.price * event.qty) })}</p>
    </div>
  );
}

interface Props {
  initial?: OfferDemoState;
  interactive?: boolean;
}

/** The "Offers in chat" screen. Interactive: one contextual button plays the negotiation. */
export function OfferChatScreen({ initial = initialOfferDemo, interactive = true }: Props) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(offerDemoReducer, initial);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.history.length]);

  const action = nextAction(state.stage);
  const resetRef = useFocusResetWhenDone<HTMLButtonElement>(action === null);
  const label =
    action === 'propose'
      ? t('offer.send', { price: formatPeso(OFFER.price), qty: OFFER.qty })
      : action === 'counter'
        ? t('offer.counter', { price: formatPeso(OFFER.counterPrice) })
        : action === 'accept'
          ? t('offer.accept', { price: formatPeso(OFFER.counterPrice) })
          : null;

  function advance() {
    if (busy || !action) return;
    dispatch({ type: action });
    setBusy(true);
    timer.current = window.setTimeout(() => setBusy(false), COOLDOWN_MS);
  }

  function reset() {
    window.clearTimeout(timer.current);
    dispatch({ type: 'reset' });
    setBusy(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 pb-2">
        <ChevronLeft size={18} className="text-muted" aria-hidden />
        <span aria-hidden className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-text">
          BR
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="m-0 flex items-center gap-1 text-xs font-semibold">
            {t('offer.farmer')} <BadgeCheck size={13} className="text-eyebrow" aria-hidden />
          </p>
          <p className="m-0 text-[10px] text-muted">{t('offer.farmerPlace')}</p>
        </div>
        <Tag size={16} className="text-accent" aria-hidden />
      </div>

      <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl bg-tint-banana p-2">
        <Photo id="mango" eager className="size-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="m-0 truncate text-[11px] font-semibold">{t('offer.listing')}</p>
          <p className="m-0 text-[10px] text-muted">
            {formatPeso(OFFER.asking)}/kg · {t('offer.negotiable')}
          </p>
        </div>
      </div>

      <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3" aria-live="polite">
        <p className="m-0 max-w-[80%] rounded-2xl rounded-tl-sm bg-surface px-3 py-2 text-[11px]">{t('offer.greeting')}</p>
        {state.history.map((e, i) => (
          <OfferCard key={i} event={e} />
        ))}
        {busy && state.stage === 'proposed' && (
          <p className="m-0 text-[10px] text-muted motion-safe:animate-pulse">{t('offer.typing')}</p>
        )}
        {state.stage === 'accepted' && (
          <div className="pop-in on-green rounded-2xl border border-eyebrow/40 bg-section-green p-3 text-center">
            <p className="m-0 flex items-center justify-center gap-1 text-sm font-semibold text-headline">
              <Check size={14} aria-hidden /> <span>{t('offer.orderCreated')}</span>
            </p>
            <p className="m-0 mt-1 text-[11px] text-muted">{t('offer.orderBody')}</p>
          </div>
        )}
      </div>

      {interactive && (
        <div className="flex flex-col gap-2 border-t border-border p-3">
          {label && (
            <button
              type="button"
              data-testid="offer-action"
              aria-disabled={busy}
              aria-busy={busy}
              onClick={advance}
              className="min-h-11 rounded-full bg-primary px-4 text-xs font-semibold text-primary-text transition hover:brightness-110 aria-disabled:cursor-wait aria-disabled:opacity-60"
            >
              {label}
            </button>
          )}
          {state.stage !== 'idle' && (
            <button ref={resetRef} type="button" onClick={reset} className="min-h-11 text-[11px] font-medium text-muted underline-offset-4 hover:text-text hover:underline">
              {t('offer.reset')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
