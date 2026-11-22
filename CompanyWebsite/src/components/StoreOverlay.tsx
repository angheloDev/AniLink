import type { CSSProperties } from 'react';
import { useI18n } from '../lib/i18n';
import type { StoreId, StoreStage } from '../lib/store';
import { LogoLoader } from './LogoLoader';
import { Modal } from './Modal';
import { QrCard, PLACEHOLDER_QR_URL } from './QrCard';

interface Props {
  stage: StoreStage;
  store: StoreId | null;
  onClose(): void;
  /** How long the fake redirect lasts, so the progress bar fills in step with it. */
  redirectMs?: number;
}

/** The fake store redirect: a loader, then a "coming soon" card with a QR code. */
export function StoreOverlay({ stage, store, onClose, redirectMs = 1600 }: Props) {
  const { t } = useI18n();
  const name = store === 'apple' ? t('store.apple') : t('store.google');
  const title = stage === 'card' ? t('store.soonTitle') : t('store.redirecting', { store: name });
  return (
    <Modal open={stage !== 'closed'} onClose={onClose} title={title}>
      {stage === 'redirecting' ? (
        <div className="flex flex-col items-center gap-5 py-4">
          <LogoLoader />
          <div aria-hidden className="progress-track h-1.5 w-44 overflow-hidden rounded-full bg-border">
            <span className="progress-fill block h-full w-full rounded-full bg-eyebrow" style={{ '--dur': `${redirectMs}ms` } as CSSProperties} />
          </div>
        </div>
      ) : (
        <div className="pop-in flex flex-col items-center gap-5 text-center">
          <p className="text-sm text-muted">{t('store.soonBody', { store: name })}</p>
          <QrCard url={PLACEHOLDER_QR_URL} />
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-text transition hover:brightness-110"
          >
            {t('store.close')}
          </button>
        </div>
      )}
    </Modal>
  );
}
