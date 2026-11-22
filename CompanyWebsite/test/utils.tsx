import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { I18nProvider } from '../src/lib/i18n';
import { StoreProvider } from '../src/lib/store';
import { ThemeProvider } from '../src/lib/theme';

/** Renders UI inside the same providers the real app uses. */
export function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <StoreProvider>{ui}</StoreProvider>
      </I18nProvider>
    </ThemeProvider>,
  );
}
