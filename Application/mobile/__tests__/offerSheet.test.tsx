import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OfferSheet } from '../src/components/OfferSheet';
import '../src/i18n';
import { ThemeProvider } from '../src/theme/ThemeProvider';

// Icons are decorative; the sheet's native keyboard handling is not what is under test.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
jest.mock('../src/components/Sheet', () => ({ Sheet: ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (visible ? children : null) }));

const base = { price: 82, unit: 'kg' as const, stock: 50, minOrder: 1, pickup: true, delivery: true };
const show = (negotiable: boolean) =>
  render(
    <ThemeProvider>
      <OfferSheet visible onClose={() => undefined} listing={{ ...base, negotiable }} onSubmit={async () => undefined} />
    </ThemeProvider>,
  );

describe('OfferSheet price field', () => {
  it('lets the buyer propose a different price when the listing is negotiable, and says so', async () => {
    await show(true);
    expect(screen.getByTestId('input-Your price per kg').props.editable).not.toBe(false);
    expect(screen.getByText(/You can propose a different price/)).toBeTruthy();
    expect(screen.getByText(/Listed at ₱82 per kg/)).toBeTruthy();
  });

  it('locks the price when the seller fixed it, so only the quantity can change', async () => {
    await show(false);
    expect(screen.getByTestId('input-Your price per kg').props.editable).toBe(false);
    expect(screen.getByText(/Fixed price: ₱82 per kg/)).toBeTruthy();
    expect(screen.queryByText(/You can propose a different price/)).toBeNull();
    expect(screen.getByTestId('input-Quantity (kg)').props.editable).not.toBe(false);
  });
});
