import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useUnreadCount } from '../api/hooks';
import { useTheme } from '../theme/useTheme';
import { IconButton } from './IconButton';
import { Text } from './Text';

export function NotificationBell() {
  const { colors } = useTheme();
  const { data: count = 0 } = useUnreadCount();
  return (
    <View>
      <IconButton testID="notification-bell" label="Notifications" onPress={() => router.push('/notifications')}>
        <Bell size={20} color={colors.text} />
      </IconButton>
      {count > 0 ? (
        <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#1F1E1B', fontSize: 10.5, lineHeight: 14, fontWeight: '700' }}>{count > 9 ? '9+' : count}</Text>
        </View>
      ) : null}
    </View>
  );
}
