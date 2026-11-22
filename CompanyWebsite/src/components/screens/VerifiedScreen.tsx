import { BadgeCheck, Clock, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { useReducedMotion } from '../../lib/reducedMotion';

/** How long the fake ID review takes before the verified badge appears. */
export const REVIEW_MS = 2000;

/** Verification screen: "Under review" turns into the verified badge. Shows the end state at once under reduced motion. */
export function VerifiedScreen() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      return;
    }
    const id = window.setTimeout(() => setDone(true), REVIEW_MS);
    return () => window.clearTimeout(id);
  }, [reduced, run]);

  function replay() {
    setDone(false);
    setRun((r) => r + 1);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1">
      <div className="flex items-baseline justify-between">
        <h3 className="m-0 font-display text-2xl text-headline">{t('verified.title')}</h3>
        <span className="rounded-full bg-sun/15 px-2 py-0.5 text-[10px] font-medium text-sun-text">{t('verified.sample')}</span>
      </div>

      <div className="rounded-2xl bg-card p-4 text-center">
        <span aria-hidden className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-text">
          BR
        </span>
        <p className="m-0 mt-2 text-sm font-semibold">{t('offer.farmer')}</p>
        <p className="m-0 text-[11px] text-muted">{t('verified.place')}</p>

        <div className="mt-4 min-h-[88px]" aria-live="polite">
          {done ? (
            <div>
              <p className="pop-in m-0 inline-flex items-center gap-1.5 rounded-full bg-eyebrow/15 px-3 py-1.5 text-xs font-semibold text-eyebrow">
                <BadgeCheck size={14} aria-hidden /> <span>{t('verified.badge')}</span>
              </p>
              <div className="pop-in mt-3 grid grid-cols-2 gap-2 text-left [--d:150ms]">
                <div className="rounded-xl bg-surface p-2">
                  <p className="m-0 flex items-center gap-1 text-sm font-semibold">
                    <Star size={13} className="fill-sun text-sun-text" aria-hidden /> 4.8
                  </p>
                  <p className="m-0 text-[10px] text-muted">{t('verified.rating')}</p>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <p className="m-0 flex items-center gap-1 text-sm font-semibold">
                    <Clock size={13} className="text-accent" aria-hidden /> ~10 min
                  </p>
                  <p className="m-0 text-[10px] text-muted">{t('verified.response')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span aria-hidden className="size-7 rounded-full border-2 border-border border-t-accent motion-safe:animate-spin" />
              <p className="m-0 text-xs font-semibold text-accent-text">{t('verified.review')}</p>
              <p className="m-0 text-[11px] text-muted">{t('verified.reviewBody')}</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={replay}
        className="min-h-11 min-w-11 self-center px-4 text-[11px] font-medium text-muted underline-offset-4 hover:text-text hover:underline"
      >
        {t('verified.replay')}
      </button>
    </div>
  );
}
