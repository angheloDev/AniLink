import { Moon, Sun } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  const light = theme === 'light';
  return (
    <button
      type="button"
      aria-label={t('toggle.themeLight')}
      aria-pressed={light}
      onClick={toggle}
      className={`inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-eyebrow ${className}`}
    >
      {light ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
