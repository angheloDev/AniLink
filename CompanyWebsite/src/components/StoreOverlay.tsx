import { useI18n } from '../lib/i18n';
import type { StoreId, StoreStage } from '../lib/store';
import { LogoLoader } from './LogoLoader';
import { Modal } from './Modal';
import { QrCard, PLACEHOLDER_QR_URL } from './QrCard';

interface Props {
  stage: StoreStage;
  store: StoreId | null;
  onClose(): void;
}

/** The fake store redirect: a loader, then a "coming soon" card with a placeholder QR code. */
export function StoreOverlay({ stage, store, onClose }: Props) {
  const { t } = useI18n();
  const name = store === 'apple' ? t('store.apple') : t('store.google');
  const title = stage === 'card' ? t('store.soonTitle') : t('store.redirecting', { store: name });
  return (
    <Modal open={stage !== 'closed'} onClose={onClose} title={title}>
      {stage === 'redirecting' ? (
        <div className="flex justify-center py-4">
          <LogoLoader />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 text-center">
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
