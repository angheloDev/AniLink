import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PriceGuideScreen } from '../src/components/screens/PriceGuideScreen';
import { REVIEW_MS, VerifiedScreen } from '../src/components/screens/VerifiedScreen';
import { en } from '../src/content/en';
import { renderWithProviders } from './utils';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error remove the matchMedia test double
  delete window.matchMedia;
});

function allowReducedMotion() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
}

describe('PriceGuideScreen', () => {
  it('shows low / average / high, the sample-data label and the below-average badge', () => {
    renderWithProviders(<PriceGuideScreen />);
    expect(screen.getByText(en['price.sample'])).toBeInTheDocument();
    expect(screen.getByText(en['price.low'])).toBeInTheDocument();
    expect(screen.getByText(en['price.avg'])).toBeInTheDocument();
    expect(screen.getByText(en['price.high'])).toBeInTheDocument();
    expect(screen.getByText('₱6 below Zamboanga avg')).toBeInTheDocument();
  });

  it('draws an 8-week sparkline', () => {
    const { container } = renderWithProviders(<PriceGuideScreen />);
    const d = container.querySelector('svg path[data-testid="sparkline"]')?.getAttribute('d') ?? '';
    expect(d.startsWith('M')).toBe(true);
    expect(d.split('L')).toHaveLength(8);
  });

  it('switching crop updates the badge', () => {
    renderWithProviders(<PriceGuideScreen />);
    const chips = screen.getAllByRole('button', { pressed: false });
    fireEvent.click(chips[0]);
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
    expect(screen.queryByText('₱6 below Zamboanga avg')).toBeNull();
  });
});

describe('VerifiedScreen', () => {
  it('starts "Under review" and becomes verified after REVIEW_MS', () => {
    renderWithProviders(<VerifiedScreen />);
    expect(screen.getByText(en['verified.review'])).toBeInTheDocument();
    expect(screen.queryByText(en['verified.badge'])).toBeNull();
    act(() => void vi.advanceTimersByTime(REVIEW_MS - 1));
    expect(screen.queryByText(en['verified.badge'])).toBeNull();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.getByText(en['verified.badge'])).toBeInTheDocument();
    expect(screen.queryByText(en['verified.review'])).toBeNull();
    expect(screen.getByText(en['verified.sample'])).toBeInTheDocument();
  });

  it('Replay runs the review again', () => {
    renderWithProviders(<VerifiedScreen />);
    act(() => void vi.advanceTimersByTime(REVIEW_MS));
    fireEvent.click(screen.getByRole('button', { name: en['verified.replay'] }));
    expect(screen.getByText(en['verified.review'])).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(REVIEW_MS));
    expect(screen.getByText(en['verified.badge'])).toBeInTheDocument();
  });

  it('under reduced motion the verified state shows at once', () => {
    allowReducedMotion();
    renderWithProviders(<VerifiedScreen />);
    expect(screen.getByText(en['verified.badge'])).toBeInTheDocument();
    expect(screen.queryByText(en['verified.review'])).toBeNull();
  });
});
