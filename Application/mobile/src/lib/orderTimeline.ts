import type { DeliveryMethod, OrderStatus } from '../api/types';

export type StepState = 'done' | 'current' | 'upcoming';
export interface TimelineStep {
  status: OrderStatus;
  state: StepState;
  at: string | null;
}

export function pathFor(delivery: DeliveryMethod): OrderStatus[] {
  return ['pending_payment', 'paid', 'preparing', delivery === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup', 'completed'];
}

export function timelineSteps(o: { status: OrderStatus; delivery: DeliveryMethod; history: { status: OrderStatus; at: string }[] }): TimelineStep[] {
  const when = (s: OrderStatus) => o.history.find((h) => h.status === s)?.at ?? null;

  if (o.status === 'cancelled') {
    const done = o.history.filter((h) => h.status !== 'cancelled').map((h) => ({ status: h.status, state: 'done' as StepState, at: h.at }));
    return [...done, { status: 'cancelled', state: 'current', at: when('cancelled') }];
  }

  const path = pathFor(o.delivery);
  const idx = path.indexOf(o.status);
  return path.map((status, i) => ({
    status,
    at: when(status),
    state: o.status === 'completed' || i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
  }));
}
