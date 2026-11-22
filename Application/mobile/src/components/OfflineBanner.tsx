import { router } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

/** Shown when the AniLink server cannot be reached; lets the user retry or fix the server address. */
export function OfflineBanner() {
  const offline = useAuth((s) => s.offline);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  if (!offline) return null;
  return (
    <View
      testID="offline-banner"
      style={{ backgroundColor: colors.danger, paddingTop: insets.top + 6, paddingBottom: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}
    >
      <WifiOff size={18} color="#fff" />
      <View style={{ flex: 1 }}>
        <Text variant="label" color="#fff">
          {t('common.offline')}
        </Text>
      </View>
      <Pressable onPress={() => void useAuth.getState().refreshMe()} hitSlop={8}>
        <Text variant="label" color="#fff" style={{ textDecorationLine: 'underline' }}>
          {t('common.retry')}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push('/server-settings')} hitSlop={8}>
        <Text variant="label" color="#fff" style={{ textDecorationLine: 'underline' }}>
          {t('common.serverAddress')}
        </Text>
      </Pressable>
    </View>
  );
}
