import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useConversations } from '../../api/hooks';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { NotificationBell } from '../../components/NotificationBell';
import { ProductArt } from '../../components/ProductArt';
import { Skeleton } from '../../components/Skeleton';
import { Text } from '../../components/Text';
import { formatChatTime } from '../../lib/format';
import { fonts } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

export default function Messages() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useConversations();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
        <Text variant="display" style={{ fontSize: 30, lineHeight: 38 }}>
          {t('chat.inboxTitle')}
        </Text>
        <NotificationBell />
      </View>
      {isLoading ? (
        <View style={{ padding: 20, gap: 18 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Skeleton width={52} height={52} radius={26} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="45%" height={14} />
                <Skeleton width="80%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          testID="inbox"
          data={data ?? []}
          keyExtractor={(c) => c.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState emoji="💬" title={t('chat.empty')} hint={t('chat.emptyHint')} />}
          renderItem={({ item: c }) => (
            <Pressable
              testID={`conversation-${c.id}`}
              onPress={() => router.push(`/chat/${c.id}`)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: pressed ? colors.surface : 'transparent' })}
            >
              <Avatar name={c.other.name} uri={c.other.photoUrl} size={54} verified={c.other.verified} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text variant="subtitle" numberOfLines={1} style={{ flexShrink: 1, fontFamily: c.unread ? fonts.bold : fonts.semibold, fontSize: 15.5 }}>
                    {c.other.name}
                  </Text>
                  <Text variant="caption" style={{ color: c.unread ? colors.accent : colors.muted }}>
                    {formatChatTime(c.lastAt)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="body" numberOfLines={1} style={{ flex: 1, color: c.unread ? colors.text : colors.muted, fontFamily: c.unread ? fonts.medium : fonts.regular, fontSize: 14 }}>
                    {c.lastMessage || t('chat.noMessages')}
                  </Text>
                  {c.unread > 0 ? (
                    <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#1F1E1B', fontSize: 11.5, fontWeight: '700', lineHeight: 16 }}>{c.unread}</Text>
                    </View>
                  ) : null}
                </View>
                {c.listing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <ProductArt title={c.listing.title} category={c.listing.category} photo={c.listing.photo} height={18} width={18} radius={5} emojiSize={10} />
                    <Text variant="caption" numberOfLines={1} style={{ flex: 1, fontSize: 11.5 }}>
                      {c.listing.title}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
