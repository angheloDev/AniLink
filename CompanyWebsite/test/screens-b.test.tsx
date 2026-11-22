import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertsScreen } from '../src/components/screens/AlertsScreen';
import { MapScreen } from '../src/components/screens/MapScreen';
import { OrderScreen } from '../src/components/screens/OrderScreen';
import { en } from '../src/content/en';
import { ROUTE } from '../src/lib/mapData';
import { pointOnPolyline } from '../src/lib/route';
import { STEP_COOLDOWN_MS, useStepper } from '../src/lib/stepper';
import { renderWithProviders } from './utils';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  // @ts-expect-error remove the matchMedia test double
  delete window.matchMedia;
});

const tick = () => act(() => void vi.advanceTimersByTime(STEP_COOLDOWN_MS));

function allowReducedMotion() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia;
}

describe('useStepper', () => {
  it('moves one step at a time and ignores clicks during the cooldown', () => {
    const { result } = renderHook(() => useStepper(3));
    act(() => {
      result.current.advance();
      result.current.advance();
    });
    expect(result.current.step).toBe(1);
    expect(result.current.busy).toBe(true);
    tick();
    expect(result.current.busy).toBe(false);
    act(() => result.current.advance());
    expect(result.current.step).toBe(2);
  });
  it('never goes past the last step', () => {
    const { result } = renderHook(() => useStepper(1));
    act(() => result.current.advance());
    tick();
    act(() => result.current.advance());
    expect(result.current.step).toBe(1);
  });
  it('reset returns to 0 and cancels a pending cooldown', () => {
    const { result } = renderHook(() => useStepper(3));
    act(() => result.current.advance());
    act(() => result.current.reset());
    expect(result.current.step).toBe(0);
    expect(result.current.busy).toBe(false);
  });
});

describe('AlertsScreen', () => {
  it('shows the notification only after the alert is set and the farmer posts', () => {
    renderWithProviders(<AlertsScreen />);
    expect(screen.queryByText(en['alerts.notifTitle'])).toBeNull();
    fireEvent.click(screen.getByTestId('step-action'));
    tick();
    expect(screen.getByText(en['alerts.active'])).toBeInTheDocument();
    expect(screen.queryByText(en['alerts.notifTitle'])).toBeNull();
    fireEvent.click(screen.getByTestId('step-action'));
    tick();
    expect(screen.getByText(en['alerts.notifTitle'])).toBeInTheDocument();
  });
  it('Reset hides the notification and restores the first button', () => {
    renderWithProviders(<AlertsScreen />);
    fireEvent.click(screen.getByTestId('step-action'));
    tick();
    fireEvent.click(screen.getByTestId('step-action'));
    tick();
    fireEvent.click(screen.getByRole('button', { name: en['offer.reset'] }));
    expect(screen.queryByText(en['alerts.notifTitle'])).toBeNull();
    expect(screen.getByTestId('step-action')).toHaveTextContent(en['alerts.setBtn']);
  });
});

describe('OrderScreen', () => {
  const state = (id: string) => document.querySelector(`[data-step="${id}"]`)?.getAttribute('data-state');
  it('completes paid, preparing, delivery, completed strictly in order', () => {
    renderWithProviders(<OrderScreen />);
    expect(['paid', 'preparing', 'delivery', 'completed'].map(state)).toEqual(['todo', 'todo', 'todo', 'todo']);
    const order: string[] = ['paid', 'preparing', 'delivery', 'completed'];
    order.forEach((id, i) => {
      fireEvent.click(screen.getByTestId('step-action'));
      tick();
      expect(state(id)).toBe('done');
      for (const later of order.slice(i + 1)) expect(state(later)).not.toBe('done');
    });
    expect(screen.queryByTestId('step-action')).toBeNull();
  });
  it('payment method chips are selectable and e-wallet is the default', () => {
    renderWithProviders(<OrderScreen />);
    expect(screen.getByRole('button', { name: en['order.ewallet'] })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: en['order.cash'] }));
    expect(screen.getByRole('button', { name: en['order.cash'] })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: en['order.ewallet'] })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('MapScreen', () => {
  it('renders several barangay pins and a rider', () => {
    renderWithProviders(<MapScreen />);
    expect(screen.getAllByTestId('map-pin').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId('rider')).toBeInTheDocument();
    expect(screen.getByText(en['map.caption'])).toBeInTheDocument();
  });
  it('animates the rider with requestAnimationFrame when motion is allowed', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    renderWithProviders(<MapScreen />);
    expect(raf).toHaveBeenCalled();
  });
  it('under reduced motion the rider is static at 60% of the route and rAF is never used', () => {
    allowReducedMotion();
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    renderWithProviders(<MapScreen />);
    expect(raf).not.toHaveBeenCalled();
    const [x, y] = pointOnPolyline(ROUTE, 0.6);
    const rider = screen.getByTestId('rider');
    expect(Number(rider.getAttribute('cx'))).toBeCloseTo(x, 1);
    expect(Number(rider.getAttribute('cy'))).toBeCloseTo(y, 1);
  });
});
