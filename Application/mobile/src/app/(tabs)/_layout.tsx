import { Redirect, Tabs } from 'expo-router';
import { Compass, House, MessageCircle, Plus, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useConversations } from '../../api/hooks';
import { tap } from '../../lib/haptics';
import { useAuth } from '../../store/auth';
import { fonts } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

interface ButtonProps {
  onPress?: (...a: never[]) => void;
  accessibilityState?: { selected?: boolean };
}

function SellButton({ onPress }: ButtonProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        testID="tab-sell"
        accessibilityRole="button"
        accessibilityLabel="Sell"
        onPress={() => {
          tap();
          (onPress as (() => void) | undefined)?.();
        }}
        style={({ pressed }) => ({
          top: -18,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: colors.bg,
          elevation: 6,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Plus size={28} color="#1F1E1B" strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const { data: conversations } = useConversations();
  const unread = (conversations ?? []).reduce((n, c) => n + c.unread, 0);

  if (!token || !user) return <Redirect href="/(auth)/welcome" />;
  if (!user.onboarded) return <Redirect href="/(onboarding)/role" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.eyebrow,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62 + insets.bottom, paddingBottom: insets.bottom + 6, paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('tabs.home'), tabBarIcon: ({ color }) => <House size={22} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: t('tabs.explore'), tabBarIcon: ({ color }) => <Compass size={22} color={color} /> }} />
      <Tabs.Screen name="sell" options={{ title: '', tabBarButton: (p) => <SellButton onPress={p.onPress as ButtonProps['onPress']} /> }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} />,
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: '#1F1E1B', fontFamily: fonts.semibold, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
