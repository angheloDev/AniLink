import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../lib/i18n';

/** The address the QR code points at. Swap it for the real download link once the app is in a store. */
export const PLACEHOLDER_QR_URL = 'https://anilink.example/download';

export function QrCard({ url, size = 148 }: { url: string; size?: number }) {
  const { t } = useI18n();
  return (
    <figure
      data-testid="qr-card"
      className="m-0 flex flex-col items-center gap-2 rounded-2xl bg-white p-4 transition duration-300 motion-safe:hover:-rotate-2 motion-safe:hover:scale-105 hover:shadow-2xl"
    >
      <div className="relative">
        <QRCodeSVG value={url} size={size} bgColor="#FFFFFF" fgColor="#0F2E28" role="img" aria-label={t('store.qrHint')} />
        <span aria-hidden className="scan-line" />
      </div>
      <figcaption className="text-xs font-medium text-[#4b4a45]">{t('store.qrHint')}</figcaption>
    </figure>
  );
}
