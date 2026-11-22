import { router } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useListings } from '../../api/hooks';
import type { ListingDTO } from '../../api/types';
import { barangayCoords } from '../../lib/barangays';
import { buildHomeSections } from '../../lib/homeSections';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { Avatar } from '../Avatar';
import { Card } from '../Card';
import { CategoryChips } from '../CategoryChips';
import { EmptyState } from '../EmptyState';
import { ListingCard } from '../ListingCard';
import { NotificationBell } from '../NotificationBell';
import { SectionHeader } from '../SectionHeader';
import { Skeleton } from '../Skeleton';
import { Stars } from '../Stars';
import { SunDecor } from '../SunDecor';
import { Text } from '../Text';

function Row({ items }: { items: ListingDTO[] }) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(l) => l.id}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      renderItem={({ item }) => <ListingCard listing={item} width={218} />}
    />
  );
}

function RowSkeleton() {
  return (
    <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20 }}>
      {[0, 1].map((i) => (
        <View key={i} style={{ width: 218, gap: 10 }}>
          <Skeleton height={124} radius={20} />
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={14} />
        </View>
      ))}
    </View>
  );
}

export function BuyerHome() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const { data: listings, isLoading, refetch, isRefetching } = useListings({ sort: 'newest' });
  const me = user.barangay ? barangayCoords(user.barangay) : null;
  const sections = useMemo(() => buildHomeSections(listings ?? [], me), [listings, me?.lat, me?.lng]);
  const firstName = user.name.split(' ')[0];

  return (
    <ScrollView
      testID="buyer-home"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32, gap: 26 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={() => void refetch()} tintColor={colors.eyebrow} colors={[colors.eyebrow]} progressBackgroundColor={colors.surface} />}
    >
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <Avatar name={user.name} uri={user.photoUrl} size={46} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" numberOfLines={1}>
              {t('home.greeting', { name: firstName })}
            </Text>
            <Text variant="caption">{t('home.greetingSub')}</Text>
          </View>
          <NotificationBell />
        </View>
        <Pressable
          testID="home-search"
          onPress={() => router.push('/(tabs)/explore')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: radii.chip, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <Search size={18} color={colors.muted} />
          <Text color="muted">{t('home.searchPlaceholder')}</Text>
        </Pressable>
      </View>

      <CategoryChips value="" onChange={(c) => router.push({ pathname: '/(tabs)/explore', params: { category: c } })} />

      <View>
        <SectionHeader eyebrow={t('home.freshEyebrow')} title={t('home.fresh')} onSeeAll={() => router.push('/(tabs)/explore')} />
        {isLoading ? <RowSkeleton /> : sections.fresh.length ? <Row items={sections.fresh} /> : <EmptyState title={t('explore.noResults')} hint={t('explore.noResultsHint')} />}
      </View>

      {sections.nearYou.length ? (
        <View>
          <SectionHeader title={t('home.nearYou')} onSeeAll={() => router.push({ pathname: '/(tabs)/explore', params: { sort: 'nearest' } })} />
          <Row items={sections.nearYou} />
        </View>
      ) : null}

      {sections.upcoming.length ? (
        <View>
          <SectionHeader title={t('home.upcoming')} onSeeAll={() => router.push({ pathname: '/(tabs)/explore', params: { preorder: '1' } })} />
          <Row items={sections.upcoming} />
        </View>
      ) : null}

      <Pressable testID="price-guide-teaser" onPress={() => router.push('/price-guide')} style={{ marginHorizontal: 20 }}>
        <View style={{ backgroundColor: colors.sectionGreen, borderRadius: radii.card, padding: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SunDecor size={110} style={{ top: -40, right: -30, opacity: 0.9 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="eyebrow">{t('common.sampleData')}</Text>
            <Text variant="title" color="headline">
              {t('home.priceGuideTitle')}
            </Text>
            <Text variant="caption">{t('home.priceGuideSub')}</Text>
          </View>
          <ChevronRight size={22} color={colors.headline} />
        </View>
      </Pressable>

      {sections.verifiedSellers.length ? (
        <View>
          <SectionHeader title={t('home.verifiedFarmers')} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sections.verifiedSellers}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            renderItem={({ item: s }) => (
              <Pressable onPress={() => router.push(`/seller/${s.id}`)}>
                <Card style={{ width: 150, alignItems: 'center', gap: 8 }}>
                  <Avatar name={s.name} uri={s.photoUrl} size={56} verified />
                  <Text variant="label" numberOfLines={1} center>
                    {s.name}
                  </Text>
                  <Stars rating={s.ratingAvg} size={13} />
                  <Text variant="caption" numberOfLines={1}>
                    {s.barangay ?? ''}
                  </Text>
                </Card>
              </Pressable>
            )}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
