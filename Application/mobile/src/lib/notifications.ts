import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'anilink';

let configured = false;

/** Sets how notifications behave and creates the Android channel. Safe to call many times. */
export async function setupNotifications(channelName = 'AniLink updates'): Promise<void> {
  if (!configured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    configured = true;
  }
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: channelName,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 120, 200],
        lightColor: '#6FBF8E',
      });
    } catch {
      // Some runtimes (Expo Go) refuse the full channel config; a bare channel is enough to notify.
      try {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: channelName, importance: Notifications.AndroidImportance.HIGH });
      } catch {
        /* notifications are a nice-to-have; never crash the app over the channel */
      }
    }
  }
}

/** Asks for permission if needed. Returns whether notifications are allowed. */
export async function ensurePermission(): Promise<boolean> {
  try {
    await setupNotifications();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return !!asked.granted;
  } catch {
    return false;
  }
}

export interface LocalNotification {
  title: string;
  body: string;
  /** app route to open when tapped, e.g. "/chat/abc" */
  route?: string;
}

/** Shows a system notification right now. Returns false if it could not be shown. */
export async function presentLocal(n: LocalNotification): Promise<boolean> {
  try {
    await setupNotifications();
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: n.title, body: n.body, data: { route: n.route ?? '/' }, sound: true },
      trigger: { channelId: CHANNEL_ID },
    });
    return true;
  } catch {
    return false;
  }
}

/** Schedules a notification for a future time; it fires even if the app is closed. */
export async function scheduleReminder(at: Date, n: LocalNotification): Promise<string | null> {
  try {
    await setupNotifications();
    return await Notifications.scheduleNotificationAsync({
      content: { title: n.title, body: n.body, data: { route: n.route ?? '/' }, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
    });
  } catch {
    return null;
  }
}
