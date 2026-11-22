import { useI18n } from '../lib/i18n';
import { Eyebrow } from './Eyebrow';
import { PLACEHOLDER_QR_URL, QrCard } from './QrCard';
import { Reveal } from './Reveal';
import { StoreButton } from './StoreButton';

/** The closing call to action: both store buttons (the fake redirect) and a QR code. */
export function Download() {
  const { t } = useI18n();
  return (
    <section id="download" className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="on-green relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-section-green p-8 sm:p-12 lg:grid-cols-[1.3fr_auto] lg:p-16">
          <span aria-hidden className="ring-pulse absolute -bottom-28 -right-28 size-80 rounded-full border border-eyebrow/15" />
          <span aria-hidden className="ring-pulse absolute -bottom-12 -right-12 size-48 rounded-full border border-eyebrow/15 [animation-delay:-3s]" />
          <div className="relative">
            <Eyebrow>{t('download.eyebrow')}</Eyebrow>
            <Reveal as="h2" delay={90} className="mb-0 mt-5 font-display text-4xl leading-[1.05] tracking-tight text-headline sm:text-5xl lg:text-6xl">
              {t('download.title')}
            </Reveal>
            <p className="mb-0 mt-5 max-w-lg text-base leading-relaxed text-text/80">{t('download.body')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StoreButton store="google" />
              <StoreButton store="apple" />
            </div>
          </div>
          <div className="relative justify-self-start lg:justify-self-end">
            <QrCard url={PLACEHOLDER_QR_URL} size={168} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
