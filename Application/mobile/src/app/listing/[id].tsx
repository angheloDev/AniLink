import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Flag, Heart, MapPin, MessageCircle, Package, Share2, Tag, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useListing, useListings, useToggleFavorite } from '../../api/hooks';
import { deleteListing, updateListing } from '../../api/endpoints';
import { Badge, VerifiedMark } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Carousel } from '../../components/Carousel';
import { EmptyState } from '../../components/EmptyState';
import { IconButton } from '../../components/IconButton';
import { ImageViewer } from '../../components/ImageViewer';
import { ListingCard } from '../../components/ListingCard';
import { ListingMap } from '../../components/ListingMap';
import { ReportSheet } from '../../components/ReportSheet';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Skeleton } from '../../components/Skeleton';
import { Avatar } from '../../components/Avatar';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { formatDate, formatPeso } from '../../lib/format';
import { useStartChat } from '../../lib/useStartChat';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.input, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      {icon}
      <View style={{ flex: 1 }}>
        <Text variant="caption" style={{ fontSize: 11 }}>
          {label}
        </Text>
        <Text variant="label" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useCurrentUser();
  const toggle = useToggleFavorite();
  const { start, loading: starting } = useStartChat();
  const { data: l, isLoading, isError } = useListing(id);
  const more = useListings({ sellerId: l?.seller.id }, { enabled: !!l });
  const [viewer, setViewer] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Skeleton height={300} radius={0} />
        <View style={{ padding: 20, gap: 12 }}>
          <Skeleton width="70%" height={26} />
          <Skeleton width="40%" height={20} />
          <Skeleton height={80} />
        </View>
      </View>
    );
  }
  if (isError || !l) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader />
        <EmptyState emoji="🥀" title={t('listing.notFound')} />
      </View>
    );
  }

  const owner = l.seller.id === user.id;
  const unit = t(`units.${l.unit}`);
  const guide = l.priceGuide;
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['listing', l.id] });
    void qc.invalidateQueries({ queryKey: ['listings'] });
  };

  async function setStatus(status: 'active' | 'paused' | 'soldout') {
    try {
      await updateListing(l!.id, { status });
      refresh();
    } catch {
      toast.show(t('common.error'), 'error');
    }
  }

  function confirmDelete() {
    Alert.alert(t('listing.deleteTitle'), t('listing.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteListing(l!.id);
            void qc.invalidateQueries({ queryKey: ['listings'] });
            router.back();
          } catch {
            toast.show(t('common.error'), 'error');
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: owner ? 40 : 120 }}>
        <View>
          <Carousel title={l.title} category={l.category} photos={l.photos} width={width} height={310} onPressImage={setViewer} />
          <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}>
            <IconButton testID="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
              <ArrowLeft size={20} color={colors.text} />
            </IconButton>
          </View>
          <View style={{ position: 'absolute', top: insets.top + 8, right: 16, flexDirection: 'row', gap: 10 }}>
            <IconButton testID="share" label={t('common.share')} onPress={() => void Share.share({ message: t('listing.shareText', { title: l.title }) })}>
              <Share2 size={19} color={colors.text} />
            </IconButton>
            <IconButton testID="favorite" label="Favorite" onPress={() => void toggle(l)}>
              <Heart size={19} color={l.favorited ? colors.accent : colors.text} fill={l.favorited ? colors.accent : 'transparent'} />
            </IconButton>
          </View>
        </View>

        <View style={{ marginTop: -26, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 20, gap: 18 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Badge label={t(`categories.${l.category}`)} tone="success" />
              {l.preorder ? <Badge label={t('common.preorder')} tone="sun" /> : null}
              <Badge label={l.negotiable ? t('listing.negotiable') : t('listing.fixedPrice')} />
              {l.status !== 'active' ? <Badge label={l.status === 'soldout' ? t('common.soldOut') : t('common.paused')} tone="danger" /> : null}
            </View>
            <Text variant="title" style={{ fontSize: 26, lineHeight: 34 }}>
              {l.title}
            </Text>
            <Text>
              <Text variant="price" style={{ fontSize: 30, lineHeight: 38 }}>
                {formatPeso(l.price)}
              </Text>
              <Text variant="body" color="muted">
                /{unit}
              </Text>
            </Text>
            {guide ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Tag size={15} color={guide.label === 'below' ? colors.success : guide.label === 'above' ? colors.accent : colors.muted} />
                <Text variant="label" style={{ color: guide.label === 'below' ? colors.success : guide.label === 'above' ? colors.accent : colors.muted }}>
                  {guide.label === 'fair' ? t('listing.fair') : t(guide.label === 'below' ? 'listing.below' : 'listing.above', { n: Math.abs(Math.round(guide.diff)) })}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
            <Fact icon={<Package size={20} color={colors.eyebrow} />} label={t('listing.stock')} value={t('common.available', { qty: l.stock, unit })} />
            <Fact icon={<Tag size={20} color={colors.eyebrow} />} label={t('listing.minOrder')} value={`${l.minOrder} ${unit}`} />
            <Fact
              icon={<Calendar size={20} color={colors.eyebrow} />}
              label={l.preorder ? t('common.preorder') : t('listing.stock')}
              value={l.harvestDate ? (l.preorder ? t('listing.expected', { date: formatDate(l.harvestDate) }) : t('listing.harvested', { date: formatDate(l.harvestDate) })) : '—'}
            />
            <Fact icon={<Truck size={20} color={colors.eyebrow} />} label={t('order.delivery')} value={[l.pickup && t('listing.pickup'), l.delivery && t('listing.delivery')].filter(Boolean).join(' · ')} />
          </View>

          {l.description ? (
            <View style={{ gap: 6 }}>
              <Text variant="subtitle">{t('listing.description')}</Text>
              <Text color="muted">{l.description}</Text>
            </View>
          ) : null}

          <Pressable onPress={() => router.push(`/seller/${l.seller.id}`)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name={l.seller.name} uri={l.seller.photoUrl} size={54} verified={l.seller.verified} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="subtitle" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {l.seller.name}
                  </Text>
                  {l.seller.verified ? <VerifiedMark size={16} /> : null}
                </View>
                {l.seller.ratingCount ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Stars rating={l.seller.ratingAvg} size={13} />
                    <Text variant="caption">{t('listing.ratingCount', { avg: l.seller.ratingAvg.toFixed(1), count: l.seller.ratingCount })}</Text>
                  </View>
                ) : (
                  <Text variant="caption">{t('listing.noRatings')}</Text>
                )}
                <Text variant="caption">{t('listing.responseTime')}</Text>
              </View>
            </Card>
          </Pressable>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={18} color={colors.eyebrow} />
              <Text variant="subtitle">{t('listing.location')}</Text>
              <Text color="muted">· {l.barangay}</Text>
            </View>
            <View style={{ height: 180, borderRadius: radii.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <ListingMap markers={[{ id: l.id, lat: l.coords.lat, lng: l.coords.lng, label: l.title, price: formatPeso(l.price) }]} onSelect={() => undefined} center={l.coords} />
            </View>
          </View>

          {(more.data ?? []).filter((m) => m.id !== l.id).length ? (
            <View style={{ gap: 12 }}>
              <Text variant="title">{t('listing.sellerListings')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                {more.data!.filter((m) => m.id !== l.id).slice(0, 6).map((m) => (
                  <ListingCard key={m.id} listing={m} width={200} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {owner ? (
            <View style={{ gap: 10 }}>
              <Text variant="caption">{t('listing.ownListing')} · {t('listing.views', { count: l.views })}</Text>
              <Button testID="edit-listing" label={t('common.edit')} onPress={() => router.push(`/listing/edit/${l.id}`)} />
              <Button variant="ghost" label={l.status === 'paused' ? t('listing.resume') : t('listing.pause')} onPress={() => void setStatus(l.status === 'paused' ? 'active' : 'paused')} />
              {l.status !== 'soldout' ? <Button variant="ghost" label={t('listing.markSold')} onPress={() => void setStatus('soldout')} /> : <Button variant="ghost" label={t('listing.resume')} onPress={() => void setStatus('active')} />}
              <Button variant="danger" label={t('common.delete')} onPress={confirmDelete} />
            </View>
          ) : (
            <Pressable onPress={() => setReportOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: 8 }}>
              <Flag size={15} color={colors.muted} />
              <Text variant="caption">{t('listing.reportTitle')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {!owner ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button testID="message-seller" variant="ghost" label={t('listing.message')} icon={<MessageCircle size={18} color={colors.text} />} loading={starting} onPress={() => void start(l.id)} style={{ flex: 1 }} />
          <Button testID="make-offer" label={t('listing.makeOffer')} disabled={l.status !== 'active'} loading={starting} onPress={() => void start(l.id, { offer: true })} style={{ flex: 1 }} />
        </View>
      ) : null}

      <ImageViewer visible={viewer !== null} photos={l.photos} initialIndex={viewer ?? 0} onClose={() => setViewer(null)} />
      <ReportSheet visible={reportOpen} onClose={() => setReportOpen(false)} targetType="listing" targetId={l.id} />
    </View>
  );
}
