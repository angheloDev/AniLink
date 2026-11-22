import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';
import { Input } from '../src/components/Input';
import { LogoLoader } from '../src/components/LogoLoader';
import { Text } from '../src/components/Text';
import { formatDate, formatPeso } from '../src/lib/format';
import { ThemeProvider } from '../src/theme/ThemeProvider';

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Log in" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Log in'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and ignores presses while loading', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Log in" onPress={onPress} loading />);
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('ignores presses when disabled', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Save" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Text', () => {
  it('uppercases the eyebrow variant', async () => {
    await wrap(<Text variant="eyebrow">gawang lokal</Text>);
    expect(screen.getByText('GAWANG LOKAL')).toBeTruthy();
  });

  it('leaves body text as written', async () => {
    await wrap(<Text>Hello Zamboanga</Text>);
    expect(screen.getByText('Hello Zamboanga')).toBeTruthy();
  });
});

describe('Input', () => {
  it('shows its label and an error message', async () => {
    await wrap(<Input label="Email" error="Enter a valid email address." value="" onChangeText={() => {}} />);
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('reports typed text', async () => {
    const onChangeText = jest.fn();
    await wrap(<Input label="Name" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByTestId('input-Name'), 'Ñandú 🍅');
    expect(onChangeText).toHaveBeenCalledWith('Ñandú 🍅');
  });
});

describe('EmptyState and LogoLoader', () => {
  it('renders an empty state title and hint', async () => {
    await wrap(<EmptyState title="No conversations yet" hint="Message a farmer to get started." />);
    expect(screen.getByText('No conversations yet')).toBeTruthy();
    expect(screen.getByText('Message a farmer to get started.')).toBeTruthy();
  });

  it('renders the logo loader with an optional label', async () => {
    await wrap(<LogoLoader label="Loading…" />);
    expect(screen.getByTestId('logo-loader')).toBeTruthy();
    expect(screen.getByText('Loading…')).toBeTruthy();
  });
});

describe('format helpers', () => {
  it('formats pesos with thousands separators and trims whole numbers', () => {
    expect(formatPeso(82)).toBe('₱82');
    expect(formatPeso(1250)).toBe('₱1,250');
    expect(formatPeso(1250.5)).toBe('₱1,250.50');
    expect(formatPeso(0)).toBe('₱0');
  });

  it('formats ISO dates and tolerates bad input', () => {
    expect(formatDate('2026-12-01')).toMatch(/Dec/);
    expect(formatDate(null)).toBe('');
    expect(formatDate('not a date')).toBe('');
  });
});
