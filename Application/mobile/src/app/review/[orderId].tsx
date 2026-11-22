import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import { reviewOrder } from '../../api/endpoints';
import { useOrder } from '../../api/hooks';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ErrorScreen } from '../../components/ErrorScreen';
import { Input } from '../../components/Input';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { ScreenLoader } from '../../components/LogoLoader';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { success } from '../../lib/haptics';

export default function Review() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: order, isError, refetch } = useOrder(orderId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  if (isError && !order) return <ErrorScreen onRetry={() => void refetch()} />;
  if (!order) return <ScreenLoader />;

  async function submit() {
    setLoading(true);
    try {
      await reviewOrder(order!.id, rating, text.trim());
      success();
      toast.show(t('order.thanks'), 'success');
      void qc.invalidateQueries({ queryKey: ['order', order!.id] });
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['profile'] });
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen
      header={<ScreenHeader title={t('order.review')} />}
      footer={
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Button testID="submit-review" label={t('order.submitReview')} loading={loading} onPress={submit} />
        </View>
      }
    >
      <View style={{ alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 24 }}>
        <Avatar name={order.seller.name} uri={order.seller.photoUrl} size={84} verified={order.seller.verified} />
        <Text variant="title">{order.seller.name}</Text>
        <Text color="muted">{order.title}</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Text variant="subtitle">{t('order.reviewTitle')}</Text>
        <Stars rating={rating} size={42} onChange={setRating} />
      </View>
      <Input value={text} onChangeText={setText} placeholder={t('order.reviewPlaceholder')} multiline numberOfLines={4} />
    </KeyboardScreen>
  );
}
