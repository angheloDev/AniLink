import { LANGUAGES, useI18n } from '../lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const index = Math.max(0, LANGUAGES.indexOf(lang));
  return (
    <div role="group" aria-label={t('toggle.language')} className={`relative inline-grid grid-cols-2 rounded-full border border-border bg-surface p-0.5 ${className}`}>
      {/* The green pill that slides to the chosen language. */}
      <span
        aria-hidden
        data-testid="lang-pill"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.3,1.3,0.5,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {LANGUAGES.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={lang === id}
          onClick={() => setLang(id)}
          className={`relative z-10 min-h-11 min-w-11 rounded-full px-3 text-xs font-semibold tracking-wider transition-colors duration-300 ${
            lang === id ? 'text-primary-text' : 'text-muted hover:text-text'
          }`}
        >
          {id.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
