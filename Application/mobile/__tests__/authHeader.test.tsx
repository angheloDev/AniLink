/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Icons are decorative; the real package ships ESM that Jest does not load.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

import { AuthHeader } from '../src/components/AuthHeader';
import i18n, { setLanguage } from '../src/i18n';
import { ThemeProvider } from '../src/theme/ThemeProvider';

const metrics = { frame: { x: 0, y: 0, width: 360, height: 760 }, insets: { top: 24, left: 0, right: 0, bottom: 0 } };
const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );

describe('AuthHeader', () => {
  afterEach(async () => {
    await setLanguage('en');
  });

  it('shows the EN | TL switch and changes the language', async () => {
    await wrap(<AuthHeader />);
    expect(screen.getByTestId('lang-en')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('lang-tl'));
    expect(i18n.language).toBe('tl');
  });
});

describe('sign-in and onboarding pages', () => {
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const pages = [
    ...fs.readdirSync(path.join(appDir, '(auth)')).map((f) => path.join('(auth)', f)),
    ...fs.readdirSync(path.join(appDir, '(onboarding)')).map((f) => path.join('(onboarding)', f)),
    'otp.tsx',
  ].filter((f) => !path.basename(f).startsWith('_'));

  it('covers every page of both flows (so a new page cannot be forgotten)', () => {
    expect(pages.length).toBeGreaterThanOrEqual(8);
  });

  it.each(pages)('%s offers the language switch', (page) => {
    const src = fs.readFileSync(path.join(appDir, page), 'utf8');
    expect(src.includes('<AuthHeader') || src.includes('<LanguageToggle')).toBe(true);
  });
});
