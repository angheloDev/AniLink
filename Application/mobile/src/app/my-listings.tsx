import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useListings } from '../api/hooks';
import { EmptyState } from '../components/EmptyState';
import { IconButton } from '../components/IconButton';
import { ListingCard } from '../components/ListingCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Skeleton } from '../components/Skeleton';
import { useTheme } from '../theme/useTheme';

export default function MyListings() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data, isLoading, refetch, isRefetching } = useListings({ mine: true });
  const cardWidth = (width - 40 - 12) / 2;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title={t('profile.myListings')}
        right={
          <IconButton testID="new-listing" label={t('home.newListing')} onPress={() => router.push('/(tabs)/sell')}>
            <Plus size={20} color={colors.text} />
          </IconButton>
        }
      />
      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <Skeleton width={cardWidth} height={230} radius={24} />
          <Skeleton width={cardWidth} height={230} radius={24} />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(l) => l.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12, flexGrow: 1 }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          renderItem={({ item }) => <ListingCard listing={item} width={cardWidth} />}
          ListEmptyComponent={<EmptyState title={t('profile.noListings')} actionLabel={t('home.newListing')} onAction={() => router.push('/(tabs)/sell')} />}
        />
      )}
    </View>
  );
}
