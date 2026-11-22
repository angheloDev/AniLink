import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ItemPicker } from '../src/components/ItemPicker';
import '../src/i18n';
import { ThemeProvider } from '../src/theme/ThemeProvider';

// Icons are decorative; the real package ships ESM that Jest does not load.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

const SUGGESTED = ['Tomato', 'Mango', 'Rice'];
let latest: string[] = [];

function Harness({ initial = [] as string[] }) {
  const [value, setValue] = useState<string[]>(initial);
  latest = value;
  return <ItemPicker label="What do you grow or make?" suggestions={SUGGESTED} value={value} onChange={setValue} />;
}
const show = (initial: string[] = []) =>
  render(
    <ThemeProvider>
      <Harness initial={initial} />
    </ThemeProvider>,
  );

describe('ItemPicker', () => {
  it('selects and unselects a suggestion with a tap', async () => {
    await show();
    await fireEvent.press(screen.getByTestId('item-chip-Mango'));
    expect(latest).toEqual(['Mango']);
    expect(screen.getByTestId('item-chip-Mango').props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getByTestId('item-chip-Mango'));
    expect(latest).toEqual([]);
  });

  it('adds several of your own items at once and clears the box', async () => {
    await show();
    await fireEvent.changeText(screen.getByTestId('item-input'), 'lanzones, durian');
    await fireEvent.press(screen.getByTestId('item-add'));
    expect(latest).toEqual(['Lanzones', 'Durian']);
    expect(screen.getByTestId('item-chip-Lanzones')).toBeTruthy();
    expect(screen.getByTestId('item-chip-Durian')).toBeTruthy();
    expect(screen.getByTestId('item-input').props.value).toBe('');
  });

  it('adds when the keyboard Done key is pressed too', async () => {
    await show();
    await fireEvent.changeText(screen.getByTestId('item-input'), 'Ube');
    await fireEvent(screen.getByTestId('item-input'), 'submitEditing');
    expect(latest).toEqual(['Ube']);
  });

  it('keeps the Add button disabled until something is typed', async () => {
    await show();
    expect(screen.getByTestId('item-add').props.accessibilityState.disabled).toBe(true);
    await fireEvent.changeText(screen.getByTestId('item-input'), 'Ube');
    expect(screen.getByTestId('item-add').props.accessibilityState.disabled).toBe(false);
  });

  it('shows your own items as chips and lets you remove one', async () => {
    await show(['Ube']);
    expect(screen.getByTestId('item-chip-Ube')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('item-chip-Ube'));
    expect(latest).toEqual([]);
    expect(screen.queryByTestId('item-chip-Ube')).toBeNull();
  });

  it('shows how many are selected and can clear them all', async () => {
    await show(['Mango', 'Rice']);
    expect(screen.getByTestId('item-count')).toHaveTextContent('2 selected');
    await fireEvent.press(screen.getByTestId('item-clear'));
    expect(latest).toEqual([]);
  });
});
