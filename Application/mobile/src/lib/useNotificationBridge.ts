import * as Notifications from 'expo-notifications';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import i18n from '../i18n';
import { onSocket } from '../socket';
import { whenNavReady } from './navReady';
import { useNotifPrefs } from '../store/prefs';
import { useAuth } from '../store/auth';
import { setupNotifications, presentLocal } from './notifications';
import { shouldPresent } from './notificationRules';
import type { NotificationDTO } from '../api/types';

async function open(route: unknown) {
  if (typeof route !== 'string' || !route.startsWith('/')) return;
  // On a cold start the navigator may not be mounted yet; wait for it instead of dropping the tap.
  await whenNavReady();
  router.push(route as never);
}

/**
 * Turns realtime server notifications into system notifications (also while the app is open),
 * opens the right screen when one is tapped, and asks for permission once for existing accounts.
 */
export function useNotificationBridge() {
  const token = useAuth((s) => s.token);
  const prefs = useNotifPrefs((s) => s.prefs);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const handledCold = useRef(false);
  const asked = useRef(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    void useNotifPrefs.getState().load();
    void setupNotifications(i18n.t('notifications.channelName'));
  }, []);

  useEffect(() => {
    if (!token) return;
    return onSocket('notification:new', ({ notification }: { notification: NotificationDTO }) => {
      if (shouldPresent(notification, { pathname: pathRef.current, prefs })) {
        void presentLocal({ title: notification.title, body: notification.body, route: notification.route });
      }
    });
  }, [token, prefs]);

  useEffect(() => {
    if (!token) return;
    const sub = Notifications.addNotificationResponseReceivedListener((r) => void open(r.notification.request.content.data?.route));
    if (!handledCold.current) {
      handledCold.current = true;
      void Notifications.getLastNotificationResponseAsync()
        .then(async (r) => {
          if (!r) return;
          await open(r.notification.request.content.data?.route);
          await Notifications.clearLastNotificationResponseAsync();
        })
        .catch(() => undefined);
    }
    return () => sub.remove();
  }, [token]);

  // Existing accounts skip onboarding, so ask once (shortly after sign-in) if the choice is still open.
  useEffect(() => {
    if (!token || asked.current) return;
    asked.current = true;
    const id = setTimeout(async () => {
      try {
        const p = await Notifications.getPermissionsAsync();
        if (!p.granted && p.canAskAgain) await Notifications.requestPermissionsAsync();
      } catch {
        /* ignore */
      }
    }, 2500);
    return () => clearTimeout(id);
  }, [token]);

  // Refresh data when coming back to the app (the socket may have been asleep in the background).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && useAuth.getState().token) void useAuth.getState().refreshMe();
    });
    return () => sub.remove();
  }, []);
}
