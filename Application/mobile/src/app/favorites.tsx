import React from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../api/hooks';
import { EmptyState } from '../components/EmptyState';
import { ListingCard } from '../components/ListingCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Skeleton } from '../components/Skeleton';
import { useTheme } from '../theme/useTheme';

export default function Favorites() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data, isLoading, refetch, isRefetching } = useFavorites();
  const cardWidth = (width - 40 - 12) / 2;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('listing.favorites')} />
      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <Skeleton width={cardWidth} height={220} radius={24} />
          <Skeleton width={cardWidth} height={220} radius={24} />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(l) => l.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => <ListingCard listing={item} width={cardWidth} />}
          ListEmptyComponent={<EmptyState emoji="💚" title={t('listing.noFavorites')} hint={t('listing.noFavoritesHint')} />}
        />
      )}
    </View>
  );
}
