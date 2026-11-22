import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../api/hooks';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ProductArt } from '../components/ProductArt';
import { ScreenHeader } from '../components/ScreenHeader';
import { Skeleton } from '../components/Skeleton';
import { StatusChip } from '../components/StatusChip';
import { Text } from '../components/Text';
import { formatDate, formatPeso } from '../lib/format';
import { useAuth } from '../store/auth';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export default function Orders() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const role = useAuth((s) => s.user?.role);
  const [tab, setTab] = useState<'buying' | 'selling'>(role === 'farmer' ? 'selling' : 'buying');
  const { data, isLoading, refetch, isRefetching } = useOrders(tab);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('order.title')} />
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, padding: 4, borderRadius: radii.chip, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
        {(['buying', 'selling'] as const).map((k) => (
          <Pressable key={k} testID={`tab-${k}`} onPress={() => setTab(k)} style={{ flex: 1, height: 38, borderRadius: radii.chip, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === k ? colors.primary : 'transparent' }}>
            <Text variant="label" style={{ color: tab === k ? colors.primaryText : colors.muted }}>
              {t(`order.${k}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      {isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Skeleton height={96} radius={24} />
          <Skeleton height={96} radius={24} />
        </View>
      ) : (
        <FlatList
          testID="orders-list"
          data={data ?? []}
          keyExtractor={(o) => o.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState emoji="📦" title={t('order.empty')} hint={t('order.emptyHint')} />}
          renderItem={({ item: o }) => (
            <Pressable testID={`order-${o.id}`} onPress={() => router.push(`/order/${o.id}`)}>
              <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <ProductArt title={o.title} category="vegetables" photo={o.photo} height={64} width={64} radius={16} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="subtitle" numberOfLines={1} style={{ fontSize: 15.5 }}>
                    {o.title}
                  </Text>
                  <Text variant="caption" numberOfLines={1}>
                    {o.quantity} {t(`units.${o.unit}`)} · {tab === 'buying' ? o.seller.name : o.buyer.name} · {formatDate(o.createdAt)}
                  </Text>
                  <StatusChip status={o.status} />
                </View>
                <Text variant="price" style={{ fontSize: 18 }}>
                  {formatPeso(o.total)}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
