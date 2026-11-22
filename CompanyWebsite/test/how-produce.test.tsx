import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { HowItWorks } from '../src/components/HowItWorks';
import { Produce } from '../src/components/Produce';
import { en } from '../src/content/en';
import { filterProduce, PRODUCE } from '../src/lib/produce';
import { renderWithProviders } from './utils';

beforeEach(() => localStorage.clear());

describe('HowItWorks', () => {
  it('shows four numbered steps for buyers first', () => {
    renderWithProviders(<HowItWorks />);
    expect(screen.getByRole('button', { name: en['how.forBuyers'] })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText(en['how.buyers.1.title'])).toBeInTheDocument();
  });

  it('the For farmers toggle swaps in four different steps', () => {
    renderWithProviders(<HowItWorks />);
    fireEvent.click(screen.getByRole('button', { name: en['how.forFarmers'] }));
    expect(screen.getByRole('button', { name: en['how.forFarmers'] })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: en['how.forBuyers'] })).toHaveAttribute('aria-pressed', 'false');
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText(en['how.farmers.1.title'])).toBeInTheDocument();
    expect(screen.queryByText(en['how.buyers.1.title'])).toBeNull();
  });
});

describe('Produce', () => {
  it('labels the cards as sample listings and shows every item at first', () => {
    renderWithProviders(<Produce />);
    expect(screen.getByText(en['produce.sample'])).toBeInTheDocument();
    expect(screen.getAllByTestId('produce-card')).toHaveLength(PRODUCE.length);
    expect(screen.getByRole('button', { name: en['cat.all'] })).toHaveAttribute('aria-pressed', 'true');
  });

  it('a category pill filters the cards and marks itself pressed; All restores them', () => {
    renderWithProviders(<Produce />);
    fireEvent.click(screen.getByRole('button', { name: en['cat.fruits'] }));
    expect(screen.getAllByTestId('produce-card')).toHaveLength(filterProduce(PRODUCE, 'fruits').length);
    expect(screen.getByRole('button', { name: en['cat.fruits'] })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: en['cat.all'] })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: en['cat.all'] }));
    expect(screen.getAllByTestId('produce-card')).toHaveLength(PRODUCE.length);
  });

  it('cards show the price with its unit and the barangay', () => {
    renderWithProviders(<Produce />);
    const card = screen.getAllByTestId('produce-card')[0];
    expect(card).toHaveTextContent(PRODUCE[0].name);
    expect(card).toHaveTextContent(`₱${PRODUCE[0].price}`);
    expect(card).toHaveTextContent(PRODUCE[0].barangay);
  });

  it('the heart toggles a saved state', () => {
    renderWithProviders(<Produce />);
    const heart = screen.getAllByRole('button', { name: /^Save / })[0];
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'true');
  });

  it('"See more in the app" opens the store facade', () => {
    renderWithProviders(<Produce />);
    fireEvent.click(screen.getByRole('button', { name: en['produce.viewAll'] }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
