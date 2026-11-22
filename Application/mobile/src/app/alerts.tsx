import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { createAlert, deleteAlert } from '../api/endpoints';
import { useAlerts } from '../api/hooks';
import { BarangayPicker } from '../components/BarangayPicker';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input, type InputRef } from '../components/Input';
import { KeyboardScreen } from '../components/KeyboardScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Text } from '../components/Text';
import { useToast } from '../components/Toast';
import { emojiFor } from '../lib/emoji';
import { useTheme } from '../theme/useTheme';

export default function Alerts() {
  const { crop: initialCrop } = useLocalSearchParams<{ crop?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const qc = useQueryClient();
  const { data } = useAlerts();
  const [crop, setCrop] = useState(initialCrop ?? '');
  const [price, setPrice] = useState('');
  const [barangay, setBarangay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const priceRef = useRef<InputRef>(null);

  async function create() {
    const maxPrice = price.trim() ? Number(price.replace(/,/g, '')) : undefined;
    if (crop.trim().length < 2) return toast.show(t('auth.errRequired'), 'error');
    if (maxPrice !== undefined && !(maxPrice > 0)) return toast.show(t('sell.errPrice'), 'error');
    setLoading(true);
    try {
      await createAlert({ crop: crop.trim(), ...(maxPrice ? { maxPrice } : {}), ...(barangay ? { barangay } : {}) });
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.show(t('alerts.created'), 'success');
      setCrop('');
      setPrice('');
      setBarangay('');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(id: string) {
    Alert.alert(t('alerts.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAlert(id).catch(() => undefined);
          void qc.invalidateQueries({ queryKey: ['alerts'] });
        },
      },
    ]);
  }

  return (
    <KeyboardScreen header={<ScreenHeader title={t('alerts.title')} />}>
      <View style={{ gap: 14 }}>
        <Card style={{ gap: 14 }}>
          <Input testID="alert-crop" label={t('alerts.crop')} value={crop} onChangeText={setCrop} placeholder={t('alerts.cropPlaceholder')} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => priceRef.current?.focus()} />
          <Input ref={priceRef} label={t('alerts.maxPrice')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" returnKeyType="done" placeholder="₱" />
          <BarangayPicker label={t('alerts.barangay')} value={barangay} onChange={setBarangay} allowAny />
          <Button testID="create-alert" label={t('alerts.create')} loading={loading} onPress={create} />
        </Card>

        <Text variant="title" style={{ marginTop: 8 }}>
          {t('alerts.title')}
        </Text>
        {(data ?? []).length === 0 ? (
          <EmptyState emoji="🔔" title={t('alerts.empty')} hint={t('alerts.emptyHint')} />
        ) : (
          (data ?? []).map((a) => (
            <Card key={a.id} testID={`alert-${a.id}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28, lineHeight: 36 }}>{emojiFor(a.crop, 'others')}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="label">{a.maxPrice != null ? t('alerts.summary', { crop: a.crop, price: a.maxPrice }) : t('alerts.summaryAny', { crop: a.crop })}</Text>
                {a.barangay ? <Text variant="caption">{a.barangay}</Text> : null}
              </View>
              <Pressable onPress={() => confirmDelete(a.id)} hitSlop={10}>
                <Trash2 size={20} color={colors.danger} />
              </Pressable>
            </Card>
          ))
        )}
      </View>
    </KeyboardScreen>
  );
}
