import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import { advanceOrder, cancelOrder } from '../../api/endpoints';
import { useListing, useOrder } from '../../api/hooks';
import type { OrderStatus } from '../../api/types';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLoader } from '../../components/LogoLoader';
import { ProductArt } from '../../components/ProductArt';
import { RiderMap } from '../../components/RiderMap';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusChip } from '../../components/StatusChip';
import { Text } from '../../components/Text';
import { Timeline } from '../../components/Timeline';
import { useToast } from '../../components/Toast';
import { barangayCoords } from '../../lib/barangays';
import { formatDate, formatPeso } from '../../lib/format';
import { timelineSteps } from '../../lib/orderTimeline';
import { useAuth, useCurrentUser } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
      <Text variant="caption">{label}</Text>
      <Text variant="label" style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();
  const me = useCurrentUser();
  const { data: o, isLoading } = useOrder(id);
  const { data: listing } = useListing(o?.listingId);
  const [busy, setBusy] = useState<string | null>(null);

  if (isLoading) return <ScreenLoader />;
  if (!o) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader />
        <EmptyState emoji="📦" title={t('listing.notFound')} />
      </View>
    );
  }

  const isBuyer = o.buyer.id === me.id;
  const other = isBuyer ? o.seller : o.buyer;
  const cancellable = ['pending_payment', 'paid', 'preparing'].includes(o.status);
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['order', o.id] });
    void qc.invalidateQueries({ queryKey: ['orders'] });
  };

  async function run(key: string, fn: () => Promise<unknown>) {
    if (busy) return;
    setBusy(key);
    try {
      await fn();
      refresh();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
      refresh();
    } finally {
      setBusy(null);
    }
  }

  function confirmCancel() {
    Alert.alert(t('order.cancel'), t('order.cancelConfirm'), [
      { text: t('common.no'), style: 'cancel' },
      { text: t('common.yes'), style: 'destructive', onPress: () => void run('cancel', () => cancelOrder(o!.id)) },
    ]);
  }

  const from: [number, number] = listing ? [listing.coords.lat, listing.coords.lng] : [6.9455, 122.0915];
  const buyerCoords = barangayCoords(isBuyer ? (me.barangay ?? 'Tetuan') : 'Tetuan') ?? { lat: 6.925, lng: 122.085 };
  const to: [number, number] = [buyerCoords.lat, buyerCoords.lng];
  const footerNeeded = (isBuyer && (o.status === 'pending_payment' || (o.status === 'completed' && !o.reviewed))) || (!isBuyer && (o.nextStatuses.length > 0 || cancellable)) || (isBuyer && cancellable);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('order.detail')} subtitle={`#${o.id.slice(-6).toUpperCase()}`} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: footerNeeded ? 200 : 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <ProductArt title={o.title} category="vegetables" photo={o.photo} height={72} width={72} radius={18} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="subtitle" numberOfLines={2}>
              {o.title}
            </Text>
            <Text variant="caption">
              {o.quantity} {t(`units.${o.unit}`)} × {formatPeso(o.pricePerUnit)}
            </Text>
            <StatusChip status={o.status} />
          </View>
        </Card>

        {o.status === 'out_for_delivery' ? <RiderMap from={from} to={to} fromLabel={listing?.barangay ?? ''} toLabel={me.barangay ?? 'Zamboanga'} riderName={t('order.riderName')} /> : null}

        <Card style={{ gap: 12 }}>
          <Text variant="subtitle">{t('order.timeline')}</Text>
          <Timeline steps={timelineSteps(o)} />
        </Card>

        <Card style={{ gap: 10 }}>
          <Row label={t('order.total')} value={formatPeso(o.total)} />
          <Row label={t('order.delivery')} value={o.delivery === 'delivery' ? t('order.homeDelivery') : t('order.pickup')} />
          <Row label={t('order.date')} value={formatDate(o.date)} />
          {o.paymentMethod ? <Row label={t('order.paymentMethod')} value={o.paymentMethod === 'cash' ? t('pay.cash') : o.paymentMethod === 'bank' ? t('pay.bank') : o.paymentMethod === 'ewallet_a' ? t('pay.ewalletA') : t('pay.ewalletB')} /> : null}
          {o.paymentRef ? <Row label={t('order.reference')} value={o.paymentRef} /> : null}
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={other.name} uri={other.photoUrl} size={44} verified={other.verified} />
          <View style={{ flex: 1 }}>
            <Text variant="caption">{isBuyer ? t('order.seller') : t('order.buyer')}</Text>
            <Text variant="subtitle">{other.name}</Text>
          </View>
        </Card>
        {isBuyer && o.reviewed ? <Text variant="caption" center>✓ {t('order.reviewed')}</Text> : null}
      </ScrollView>

      {footerNeeded ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, gap: 10, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
          {isBuyer && o.status === 'pending_payment' ? <Button testID="pay-now" label={t('order.payNow')} onPress={() => router.push(`/pay/${o.id}`)} /> : null}
          {isBuyer && o.status === 'completed' && !o.reviewed ? <Button testID="leave-review" label={t('order.review')} onPress={() => router.push(`/review/${o.id}`)} /> : null}
          {!isBuyer
            ? o.nextStatuses.map((s: OrderStatus) => (
                <Button key={s} testID={`advance-${s}`} label={t('order.advanceTo', { status: t(`order.status.${s}`) })} loading={busy === s} onPress={() => void run(s, () => advanceOrder(o.id, s))} />
              ))
            : null}
          {cancellable ? <Button testID="cancel-order" variant="danger" label={t('order.cancel')} loading={busy === 'cancel'} onPress={confirmCancel} /> : null}
        </View>
      ) : null}
    </View>
  );
}
