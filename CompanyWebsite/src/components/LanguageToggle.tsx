import { LANGUAGES, useI18n } from '../lib/i18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('toggle.language')} className={`inline-flex rounded-full border border-border bg-surface p-0.5 ${className}`}>
      {LANGUAGES.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={lang === id}
          onClick={() => setLang(id)}
          className={`min-h-11 min-w-11 rounded-full px-3 text-xs font-semibold tracking-wider transition ${
            lang === id ? 'bg-primary text-primary-text' : 'text-muted hover:text-text'
          }`}
        >
          {id.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
