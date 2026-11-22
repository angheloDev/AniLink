import type { OrderStatus } from '../src/api/types';
import { timelineSteps } from '../src/lib/orderTimeline';
import { interpolateRoute } from '../src/lib/riderRoute';

const at = (s: string) => `2026-11-2${s}T10:00:00.000Z`;
const order = (status: OrderStatus, delivery: 'pickup' | 'delivery', history: [OrderStatus, string][]) => ({
  status,
  delivery,
  history: history.map(([s, d]) => ({ status: s, at: at(d) })),
});
const summary = (steps: ReturnType<typeof timelineSteps>) => steps.map((s) => `${s.status}:${s.state}`);

describe('timelineSteps', () => {
  it('lists the pickup path with done / current / upcoming', () => {
    const steps = timelineSteps(order('preparing', 'pickup', [['pending_payment', '1'], ['paid', '1'], ['preparing', '2']]));
    expect(summary(steps)).toEqual(['pending_payment:done', 'paid:done', 'preparing:current', 'ready_for_pickup:upcoming', 'completed:upcoming']);
  });

  it('uses out_for_delivery instead of ready_for_pickup on the delivery path', () => {
    const steps = timelineSteps(order('paid', 'delivery', [['pending_payment', '1'], ['paid', '1']]));
    expect(summary(steps)).toEqual(['pending_payment:done', 'paid:current', 'preparing:upcoming', 'out_for_delivery:upcoming', 'completed:upcoming']);
  });

  it('marks every step done when completed', () => {
    const steps = timelineSteps(order('completed', 'pickup', [['pending_payment', '1'], ['paid', '1'], ['preparing', '2'], ['ready_for_pickup', '3'], ['completed', '4']]));
    expect(steps.every((s) => s.state === 'done')).toBe(true);
  });

  it('attaches the time each step happened, or null when it was skipped (cash orders skip "paid")', () => {
    const steps = timelineSteps(order('preparing', 'pickup', [['pending_payment', '1'], ['preparing', '2']]));
    expect(steps.find((s) => s.status === 'pending_payment')!.at).toBe(at('1'));
    expect(steps.find((s) => s.status === 'paid')).toMatchObject({ state: 'done', at: null });
    expect(steps.find((s) => s.status === 'preparing')!.at).toBe(at('2'));
  });

  it('shows what happened and then "cancelled" for a cancelled order', () => {
    const steps = timelineSteps(order('cancelled', 'pickup', [['pending_payment', '1'], ['cancelled', '2']]));
    expect(summary(steps)).toEqual(['pending_payment:done', 'cancelled:current']);
  });
});

describe('interpolateRoute', () => {
  const a: [number, number] = [6.9455, 122.0915];
  const b: [number, number] = [6.9085, 122.077];

  it('returns steps + 1 points starting and ending exactly at the endpoints', () => {
    const r = interpolateRoute(a, b, 10);
    expect(r).toHaveLength(11);
    expect(r[0]).toEqual(a);
    expect(r[10]).toEqual(b);
  });

  it('moves evenly in a straight line', () => {
    const r = interpolateRoute([0, 0], [10, 20], 2);
    expect(r).toEqual([[0, 0], [5, 10], [10, 20]]);
  });

  it('treats fewer than one step as a single hop', () => {
    expect(interpolateRoute(a, b, 0)).toEqual([a, b]);
  });
});
