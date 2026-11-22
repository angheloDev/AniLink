import { router, useLocalSearchParams } from 'expo-router';
import { Ban, Flag, MoreVertical } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { blockUser } from '../../api/endpoints';
import { useListings, useProfile } from '../../api/hooks';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { ErrorScreen } from '../../components/ErrorScreen';
import { IconButton } from '../../components/IconButton';
import { ListingCard } from '../../components/ListingCard';
import { ReportSheet } from '../../components/ReportSheet';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Sheet } from '../../components/Sheet';
import { Skeleton } from '../../components/Skeleton';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../lib/format';
import { useAuth, useCurrentUser } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function SellerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const qc = useQueryClient();
  const me = useCurrentUser();
  const { data, isLoading, isError, refetch } = useProfile(id);
  const listings = useListings({ sellerId: id });
  const [menu, setMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const cardWidth = (width - 40 - 12) / 2;
  const self = id === me.id;

  function confirmBlock() {
    setMenu(false);
    Alert.alert(t('common.block'), t('chat.blockConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.block'),
        style: 'destructive',
        onPress: async () => {
          try {
            await blockUser(id!);
            void qc.invalidateQueries({ queryKey: ['listings'] });
            toast.show(t('chat.youBlocked'), 'success');
            router.back();
          } catch {
            toast.show(t('common.error'), 'error');
          }
        },
      },
    ]);
  }

  if (isError && !data) return <ErrorScreen onRetry={() => void refetch()} />;
  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader />
        <View style={{ padding: 20, gap: 14, alignItems: 'center' }}>
          <Skeleton width={96} height={96} radius={48} />
          <Skeleton width="50%" height={22} />
          <Skeleton width="70%" />
        </View>
      </View>
    );
  }

  const u = data.user;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        right={
          self ? undefined : (
            <IconButton testID="seller-menu" label="Menu" onPress={() => setMenu(true)}>
              <MoreVertical size={20} color={colors.text} />
            </IconButton>
          )
        }
      />
      <FlatList
        data={listings.data ?? []}
        keyExtractor={(l) => l.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ListingCard listing={item} width={cardWidth} />}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 8 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Avatar name={u.name} uri={u.photoUrl} size={96} verified={u.verified} />
              <Text variant="title">{u.name}</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {u.verified ? <Badge label={t('common.verified')} tone="success" /> : null}
                {u.barangay ? <Badge label={u.barangay} /> : null}
              </View>
              {u.ratingCount ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Stars rating={u.ratingAvg} size={16} />
                  <Text variant="label">{t('listing.ratingCount', { avg: u.ratingAvg.toFixed(1), count: u.ratingCount })}</Text>
                </View>
              ) : (
                <Text variant="caption">{t('listing.noRatings')}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text variant="title" color="headline">
                  {u.completedOrders}
                </Text>
                <Text variant="caption" center>
                  {t('profile.completedLabel')}
                </Text>
              </Card>
              <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text variant="title" color="headline">
                  {u.listingsCount}
                </Text>
                <Text variant="caption" center>
                  {t('home.activeListings')}
                </Text>
              </Card>
            </View>
            {u.farm?.description ? <Text color="muted">{u.farm.description}</Text> : null}
            {u.farm?.crops?.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {u.farm.crops.map((c) => (
                  <Chip key={c} label={c} />
                ))}
              </View>
            ) : null}
            <Text variant="caption">{t('profile.memberSince', { date: formatDate(u.createdAt) })}</Text>
            <Text variant="title">{t('profile.listingsTitle')}</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('profile.noListings')} />}
        ListFooterComponent={
          <View style={{ gap: 12, marginTop: 20 }}>
            <Text variant="title">{t('profile.reviews')}</Text>
            {data.reviews.length === 0 ? (
              <Text color="muted">{t('profile.noReviews')}</Text>
            ) : (
              data.reviews.map((r) => (
                <Card key={r.id} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Avatar name={r.buyer.name} uri={r.buyer.photoUrl} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text variant="label">{r.buyer.name}</Text>
                      <Text variant="caption">{formatDate(r.createdAt)}</Text>
                    </View>
                    <Stars rating={r.rating} size={13} />
                  </View>
                  {r.text ? <Text color="muted">{r.text}</Text> : null}
                </Card>
              ))
            )}
          </View>
        }
      />
      <Sheet visible={menu} onClose={() => setMenu(false)}>
        <View style={{ gap: 4 }}>
          <Pressable
            onPress={() => {
              setMenu(false);
              setReportOpen(true);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}
          >
            <Flag size={20} color={colors.text} />
            <Text>{t('common.report')}</Text>
          </Pressable>
          <Pressable testID="block-user" onPress={confirmBlock} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
            <Ban size={20} color={colors.danger} />
            <Text color="danger">{t('common.block')}</Text>
          </Pressable>
        </View>
      </Sheet>
      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="user" targetId={u.id} />
    </View>
  );
}
