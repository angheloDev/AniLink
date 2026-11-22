import { DEFAULT_PREFS, reminderTime, shouldPresent, type NotifPrefs } from '../src/lib/notificationRules';

const n = (type: 'message' | 'offer' | 'order' | 'verification' | 'alert' | 'price', route = '/chat/abc') => ({ type, route });

describe('shouldPresent', () => {
  it('shows notifications by default, even while the app is open', () => {
    expect(shouldPresent(n('message'), { pathname: '/(tabs)/home', prefs: DEFAULT_PREFS })).toBe(true);
    expect(shouldPresent(n('order', '/order/1'), { pathname: '/', prefs: DEFAULT_PREFS })).toBe(true);
  });

  it('stays quiet about a chat you are already looking at', () => {
    expect(shouldPresent(n('message', '/chat/abc'), { pathname: '/chat/abc', prefs: DEFAULT_PREFS })).toBe(false);
    expect(shouldPresent(n('offer', '/chat/abc'), { pathname: '/chat/abc', prefs: DEFAULT_PREFS })).toBe(false);
    expect(shouldPresent(n('message', '/chat/abc'), { pathname: '/chat/other', prefs: DEFAULT_PREFS })).toBe(true);
  });

  it('respects the per-type switches in settings', () => {
    const prefs: NotifPrefs = { messages: false, offers: true, orders: false, alerts: true };
    expect(shouldPresent(n('message'), { pathname: '/', prefs })).toBe(false);
    expect(shouldPresent(n('offer'), { pathname: '/', prefs })).toBe(true);
    expect(shouldPresent(n('order', '/order/1'), { pathname: '/', prefs })).toBe(false);
    expect(shouldPresent(n('alert', '/listing/1'), { pathname: '/', prefs })).toBe(true);
    expect(shouldPresent(n('price', '/listing/1'), { pathname: '/', prefs: { ...prefs, alerts: false } })).toBe(false);
  });

  it('always shows account notices such as verification', () => {
    expect(shouldPresent(n('verification', '/verification'), { pathname: '/', prefs: { messages: false, offers: false, orders: false, alerts: false } })).toBe(true);
  });
});

describe('reminderTime', () => {
  const now = new Date(2026, 10, 21, 9, 30); // 21 Nov 2026 09:30 local

  it('is 8 AM on the given date when that is still in the future', () => {
    const r = reminderTime('2026-11-22', now)!;
    expect([r.getFullYear(), r.getMonth(), r.getDate(), r.getHours(), r.getMinutes()]).toEqual([2026, 10, 22, 8, 0]);
  });

  it('is null for a date whose 8 AM has already passed, or a bad date', () => {
    expect(reminderTime('2026-11-21', now)).toBeNull();
    expect(reminderTime('2026-11-01', now)).toBeNull();
    expect(reminderTime('nonsense', now)).toBeNull();
  });

  it('allows another hour', () => {
    expect(reminderTime('2026-11-21', now, 17)!.getHours()).toBe(17);
  });
});
