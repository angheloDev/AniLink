import { router } from 'expo-router';
import { ChevronRight, Eye, Package, PiggyBank, Plus, Sprout, Tag } from 'lucide-react-native';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDashboard, useListings } from '../../api/hooks';
import { formatPeso } from '../../lib/format';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../Avatar';
import { Card } from '../Card';
import { EmptyState } from '../EmptyState';
import { ListingCard } from '../ListingCard';
import { NotificationBell } from '../NotificationBell';
import { SectionHeader } from '../SectionHeader';
import { Skeleton } from '../Skeleton';
import { StatTile } from '../StatTile';
import { Text } from '../Text';

function Action({ icon, label, onPress, testID }: { icon: React.ReactNode; label: string; onPress: () => void; testID?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: radii.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.sectionGreen, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

export function FarmerHome() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const dash = useDashboard();
  const mine = useListings({ mine: true });
  const d = dash.data;
  const refreshing = (dash.isRefetching || mine.isRefetching) && !dash.isLoading;

  return (
    <ScrollView
      testID="farmer-home"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32, gap: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void Promise.all([dash.refetch(), mine.refetch()])} tintColor={colors.eyebrow} colors={[colors.eyebrow]} progressBackgroundColor={colors.surface} />}
    >
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Avatar name={user.name} uri={user.photoUrl} size={46} verified={user.verification.status === 'verified'} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow">{t('home.dashboard')}</Text>
          <Text variant="subtitle" numberOfLines={1}>
            {t('home.greeting', { name: user.name.split(' ')[0] })}
          </Text>
        </View>
        <NotificationBell />
      </View>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {dash.isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={86} radius={24} />
            <Skeleton height={86} radius={24} />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatTile testID="stat-listings" label={t('home.activeListings')} value={d?.activeListings ?? 0} icon={<Sprout size={18} color={colors.eyebrow} />} />
              <StatTile testID="stat-offers" label={t('home.pendingOffers')} value={d?.pendingOffers ?? 0} icon={<Tag size={18} color={colors.accent} />} highlight={(d?.pendingOffers ?? 0) > 0} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatTile testID="stat-orders" label={t('home.orders')} value={d?.openOrders ?? 0} icon={<Package size={18} color={colors.eyebrow} />} />
              <StatTile testID="stat-earnings" label={t('home.earnings')} value={formatPeso(d?.earningsThisMonth ?? 0)} icon={<PiggyBank size={18} color={colors.sun} />} />
            </View>
            <StatTile testID="stat-views" label={t('home.views')} value={d?.views ?? 0} icon={<Eye size={18} color={colors.muted} />} />
          </>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Text variant="title" color="headline">
          {t('home.quickActions')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Action testID="action-new" label={t('home.newListing')} icon={<Plus size={20} color={colors.eyebrow} />} onPress={() => router.push('/(tabs)/sell')} />
          <Action label={t('home.offers')} icon={<Tag size={20} color={colors.eyebrow} />} onPress={() => router.push('/(tabs)/messages')} />
          <Action label={t('home.orders')} icon={<Package size={20} color={colors.eyebrow} />} onPress={() => router.push('/orders')} />
        </View>
      </View>

      <View>
        <SectionHeader title={t('home.recentOffers')} />
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {(d?.recentOffers ?? []).length === 0 ? (
            <Card>
              <Text color="muted">{t('home.noOffers')}</Text>
            </Card>
          ) : (
            d!.recentOffers.map((o) => (
              <Pressable key={o.id} onPress={() => router.push(`/chat/${o.conversationId}`)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={o.buyerName} uri={o.buyerPhotoUrl} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label" numberOfLines={1}>
                      {o.buyerName}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {o.listingTitle} · {o.quantity} {t(`units.${o.unit}`)}
                    </Text>
                  </View>
                  <Text variant="subtitle" color="accent">
                    {formatPeso(o.pricePerUnit)}
                  </Text>
                  <ChevronRight size={18} color={colors.muted} />
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </View>

      <View>
        <SectionHeader title={t('profile.myListings')} onSeeAll={() => router.push('/my-listings')} />
        {mine.isLoading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Skeleton height={200} radius={24} />
          </View>
        ) : (mine.data ?? []).length === 0 ? (
          <EmptyState title={t('profile.noListings')} actionLabel={t('home.newListing')} onAction={() => router.push('/(tabs)/sell')} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {mine.data!.slice(0, 6).map((l) => (
              <ListingCard key={l.id} listing={l} width={218} />
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}
