import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../lib/i18n';

/** Placeholder target: replace with the real download link once the app is in a store. */
export const PLACEHOLDER_QR_URL = 'https://anilink.example/download';

export function QrCard({ url, size = 148 }: { url: string; size?: number }) {
  const { t } = useI18n();
  return (
    <figure data-testid="qr-card" className="m-0 flex flex-col items-center gap-2 rounded-2xl bg-white p-4">
      <QRCodeSVG value={url} size={size} bgColor="#FFFFFF" fgColor="#0F2E28" role="img" aria-label={t('store.qrHint')} />
      <figcaption className="text-xs font-medium text-[#4b4a45]">{t('store.qrHint')}</figcaption>
    </figure>
  );
}
