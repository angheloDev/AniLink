import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { BadgeCheck, MessageCircle, Package, Sprout, Tag, TrendingDown } from 'lucide-react-native';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { markNotificationsRead } from '../api/endpoints';
import { useNotifications } from '../api/hooks';
import type { NotificationDTO } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { Skeleton } from '../components/Skeleton';
import { Text } from '../components/Text';
import { formatChatTime } from '../lib/format';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

function iconFor(type: NotificationDTO['type'], color: string) {
  const p = { size: 20, color };
  switch (type) {
    case 'message':
      return <MessageCircle {...p} />;
    case 'offer':
      return <Tag {...p} />;
    case 'order':
      return <Package {...p} />;
    case 'verification':
      return <BadgeCheck {...p} />;
    case 'alert':
      return <Sprout {...p} />;
    default:
      return <TrendingDown {...p} />;
  }
}

export default function Notifications() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const unread = (data ?? []).filter((n) => !n.read).length;

  async function readAll() {
    await markNotificationsRead().catch(() => undefined);
    void qc.invalidateQueries({ queryKey: ['notifications'] });
    void qc.invalidateQueries({ queryKey: ['unread'] });
  }

  async function open(n: NotificationDTO) {
    if (!n.read) {
      void markNotificationsRead([n.id])
        .then(() => {
          void qc.invalidateQueries({ queryKey: ['notifications'] });
          void qc.invalidateQueries({ queryKey: ['unread'] });
        })
        .catch(() => undefined);
    }
    if (n.route && n.route !== '/') router.push(n.route as never);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title={t('notifications.title')}
        right={
          unread > 0 ? (
            <Pressable testID="mark-all-read" onPress={readAll} hitSlop={8}>
              <Text variant="label" color="eyebrow">
                {t('notifications.markAllRead')}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      {isLoading ? (
        <View style={{ padding: 20, gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
              <Skeleton width={44} height={44} radius={22} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="50%" height={14} />
                <Skeleton width="85%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          testID="notification-list"
          data={data ?? []}
          keyExtractor={(n) => n.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState emoji="🔔" title={t('notifications.empty')} hint={t('notifications.emptyHint')} />}
          renderItem={({ item: n }) => (
            <Pressable
              testID={`notification-${n.id}`}
              onPress={() => void open(n)}
              style={({ pressed }) => ({ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: pressed ? colors.surface : n.read ? 'transparent' : colors.sectionGreen + '66' })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sectionGreen, alignItems: 'center', justifyContent: 'center' }}>{iconFor(n.type, colors.eyebrow)}</View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Text variant="label" numberOfLines={1} style={{ flex: 1, fontFamily: n.read ? fonts.medium : fonts.bold }}>
                    {n.title}
                  </Text>
                  <Text variant="caption">{formatChatTime(n.createdAt)}</Text>
                </View>
                <Text variant="caption" numberOfLines={2} style={{ fontSize: 13 }}>
                  {n.body}
                </Text>
              </View>
              {!n.read ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent, marginTop: 6 }} /> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
