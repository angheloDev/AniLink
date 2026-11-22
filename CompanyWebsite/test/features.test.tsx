import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { FEATURE_IDS, Features } from '../src/components/Features';
import { en } from '../src/content/en';
import { renderWithProviders } from './utils';

beforeEach(() => localStorage.clear());

const tabs = () => screen.getAllByRole('tab');

describe('Features showcase', () => {
  it('has the six feature tabs and selects the first', () => {
    renderWithProviders(<Features />);
    expect(FEATURE_IDS).toEqual(['offers', 'verified', 'price', 'alerts', 'map', 'orders']);
    expect(tabs()).toHaveLength(6);
    expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs().slice(1).every((t) => t.getAttribute('aria-selected') === 'false')).toBe(true);
  });

  it('clicking a tab shows its screen in the phone and labels the panel', () => {
    renderWithProviders(<Features />);
    expect(within(screen.getByRole('tabpanel')).getByTestId('offer-action')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Price guide/ }));
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent(en['price.sample']);
    expect(panel).toHaveAttribute('aria-labelledby', screen.getByRole('tab', { name: /Price guide/ }).id);
    fireEvent.click(screen.getByRole('tab', { name: /Map & delivery/ }));
    expect(within(screen.getByRole('tabpanel')).getAllByTestId('map-pin').length).toBeGreaterThan(2);
  });

  it('arrow keys, Home and End move the selection (wrapping) and focus follows', async () => {
    renderWithProviders(<Features />);
    const user = userEvent.setup();
    tabs()[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(tabs()[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs()[1]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(tabs()[5]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Home}');
    expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(tabs()[5]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(tabs()[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('only the active tab is in the tab order', () => {
    renderWithProviders(<Features />);
    expect(tabs()[0]).toHaveAttribute('tabindex', '0');
    expect(tabs().slice(1).every((t) => t.getAttribute('tabindex') === '-1')).toBe(true);
  });

  it('switching tabs restarts the demo (screens remount)', () => {
    renderWithProviders(<Features />);
    fireEvent.click(screen.getByTestId('offer-action'));
    expect(screen.getAllByText(en['offer.cardOffer']).length).toBe(1);
    fireEvent.click(screen.getByRole('tab', { name: /Price guide/ }));
    fireEvent.click(screen.getByRole('tab', { name: /Offers in chat/ }));
    expect(screen.queryByText(en['offer.cardOffer'])).toBeNull();
  });

  it('only the tab row scrolls sideways, never the section itself', () => {
    const { container } = renderWithProviders(<Features />);
    expect(screen.getByRole('tablist').className).toContain('overflow-x-auto');
    const section = container.querySelector('#features') as HTMLElement;
    expect(section.className).not.toContain('overflow-x-auto');
    expect(section.className).not.toContain('overflow-x-scroll');
  });
});
