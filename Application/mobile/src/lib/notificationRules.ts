import type { NotificationDTO } from '../api/types';
import { isValidIsoDate } from './dates';

export interface NotifPrefs {
  messages: boolean;
  offers: boolean;
  orders: boolean;
  alerts: boolean;
}

export const DEFAULT_PREFS: NotifPrefs = { messages: true, offers: true, orders: true, alerts: true };

/**
 * Whether a server notification should pop up as a system notification.
 * It shows even while the app is open, except for the chat you are already reading
 * and types the user switched off in Settings. Account notices (verification) always show.
 */
export function shouldPresent(n: Pick<NotificationDTO, 'type' | 'route'>, ctx: { pathname: string; prefs: NotifPrefs }): boolean {
  if ((n.type === 'message' || n.type === 'offer') && n.route === ctx.pathname) return false;
  switch (n.type) {
    case 'message':
      return ctx.prefs.messages;
    case 'offer':
      return ctx.prefs.offers;
    case 'order':
      return ctx.prefs.orders;
    case 'alert':
    case 'price':
      return ctx.prefs.alerts;
    default:
      return true;
  }
}

/** The moment to remind about a date (default 8 AM local), or null if that moment has passed. */
export function reminderTime(dateIso: string, now: Date = new Date(), hour = 8): Date | null {
  if (!isValidIsoDate(dateIso)) return null;
  const [y, m, d] = dateIso.split('-').map(Number);
  const at = new Date(y, m - 1, d, hour, 0, 0, 0);
  return at.getTime() > now.getTime() ? at : null;
}
