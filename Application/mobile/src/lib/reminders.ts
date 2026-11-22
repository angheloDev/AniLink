import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import i18n from '../i18n';
import type { OrderDTO } from '../api/types';
import { scheduleReminder } from './notifications';
import { reminderTime } from './notificationRules';

const KEY = 'anilink.reminders';

async function read(): Promise<Record<string, string>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}
async function write(m: Record<string, string>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export async function cancelReminder(key: string): Promise<void> {
  const map = await read();
  if (map[key]) {
    try {
      await Notifications.cancelScheduledNotificationAsync(map[key]);
    } catch {
      /* already gone */
    }
    delete map[key];
    await write(map);
  }
}

/** Schedules (or re-schedules) one reminder for a key. Fires even when the app is closed. */
export async function scheduleOnce(key: string, at: Date, n: { title: string; body: string; route: string }): Promise<void> {
  await cancelReminder(key);
  const id = await scheduleReminder(at, n);
  if (id) {
    const map = await read();
    map[key] = id;
    await write(map);
  }
}

const ACTIVE: OrderDTO['status'][] = ['paid', 'preparing', 'ready_for_pickup', 'out_for_delivery'];

/** Keeps a "pickup / delivery today" reminder in step with the user's open orders. */
export async function syncOrderReminders(orders: OrderDTO[]): Promise<void> {
  const map = await read();
  for (const o of orders) {
    const key = `order:${o.id}`;
    if (!ACTIVE.includes(o.status)) {
      if (map[key]) await cancelReminder(key);
      continue;
    }
    const at = reminderTime(o.date);
    if (!at || map[key]) continue;
    await scheduleOnce(key, at, {
      title: i18n.t(o.delivery === 'delivery' ? 'notifications.reminderDelivery' : 'notifications.reminderPickup'),
      body: `${o.title} · ${o.quantity} ${i18n.t(`units.${o.unit}`)}`,
      route: `/order/${o.id}`,
    });
  }
}

export async function scheduleHarvestReminder(listing: { id: string; title: string; harvestDate: string }): Promise<void> {
  const at = reminderTime(listing.harvestDate.slice(0, 10));
  if (!at) return;
  await scheduleOnce(`harvest:${listing.id}`, at, { title: i18n.t('notifications.reminderHarvest'), body: i18n.t('notifications.reminderHarvestBody', { title: listing.title }), route: `/listing/${listing.id}` });
}
