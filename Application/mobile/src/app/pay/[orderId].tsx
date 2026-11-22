import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Banknote, Check, Landmark, Smartphone, Wallet } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import { payOrder } from '../../api/endpoints';
import { useOrder } from '../../api/hooks';
import type { OrderDTO, PaymentMethod } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ErrorScreen } from '../../components/ErrorScreen';
import { Input } from '../../components/Input';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { LogoLoader, ScreenLoader } from '../../components/LogoLoader';
import { MpinKeypad } from '../../components/MpinKeypad';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { success } from '../../lib/haptics';
import { formatPeso } from '../../lib/format';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

type Step = 'method' | 'wallet' | 'bank' | 'processing' | 'receipt';

const BRAND: Record<'ewallet_a' | 'ewallet_b' | 'bank', string> = { ewallet_a: '#2F6FED', ewallet_b: '#18A06A', bank: '#7A4FD0' };

/**
 * Payment facade: looks and behaves like a wallet checkout but no real money moves.
 * The only real effect is the server marking the order as paid.
 */
export default function Pay() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useCurrentUser();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PaymentMethod>('ewallet_a');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [pin, setPin] = useState('');
  const [paid, setPaid] = useState<OrderDTO | null>(null);
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (step === 'receipt') {
      success();
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14 }).start();
    }
  }, [step, scale]);

  if (isError && !order) return <ErrorScreen onRetry={() => void refetch()} />;
  if (isLoading || !order) return <ScreenLoader />;

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'ewallet_a', label: t('pay.ewalletA'), icon: <Wallet size={22} color="#fff" />, color: BRAND.ewallet_a },
    { id: 'ewallet_b', label: t('pay.ewalletB'), icon: <Smartphone size={22} color="#fff" />, color: BRAND.ewallet_b },
    { id: 'bank', label: t('pay.bank'), icon: <Landmark size={22} color="#fff" />, color: BRAND.bank },
    { id: 'cash', label: t('pay.cash'), icon: <Banknote size={22} color="#1F1E1B" />, color: colors.sun },
  ];

  async function process(m: PaymentMethod) {
    setStep('processing');
    try {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await payOrder(order!.id, m);
      setPaid(res.order);
      void qc.invalidateQueries({ queryKey: ['order', order!.id] });
      void qc.invalidateQueries({ queryKey: ['orders'] });
      setStep('receipt');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
      setPin('');
      setStep('method');
    }
  }

  function choose() {
    if (method === 'cash') void process('cash');
    else setStep(method === 'bank' ? 'bank' : 'wallet');
  }

  if (step === 'processing') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <LogoLoader size={72} label={t('pay.processing')} />
      </View>
    );
  }

  if (step === 'receipt' && paid) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center', gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <Animated.View style={{ transform: [{ scale }], width: 96, height: 96, borderRadius: 48, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
            <Check size={54} color="#1F1E1B" strokeWidth={3.2} />
          </Animated.View>
          <Text variant="display" center>
            {method === 'cash' ? t('pay.cashSet') : t('pay.success')}
          </Text>
        </View>
        <Card style={{ gap: 12 }} testID="receipt">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text color="muted">{t('pay.amount')}</Text>
            <Text variant="price">{formatPeso(paid.total)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text color="muted">{t('pay.receiptRef')}</Text>
            <Text variant="label" testID="payment-ref">
              {paid.paymentRef}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text color="muted">{t('order.paymentMethod')}</Text>
            <Text variant="label">{methods.find((m) => m.id === method)?.label}</Text>
          </View>
        </Card>
        <Text variant="caption" center>
          {t('pay.demoNote')}
        </Text>
        <Button testID="back-to-order" label={t('pay.backToOrder')} onPress={() => router.replace(`/order/${paid.id}`)} />
      </View>
    );
  }

  if (step === 'wallet' || step === 'bank') {
    const color = BRAND[method === 'bank' ? 'bank' : (method as 'ewallet_a' | 'ewallet_b')];
    const label = methods.find((m) => m.id === method)!.label;
    const isBank = step === 'bank';
    const ready = isBank || (pin.length === 4 && phone.trim().length >= 7);
    return (
      <KeyboardScreen
        header={<ScreenHeader title={t('pay.walletTitle')} onBack={() => setStep('method')} />}
        footer={
          <View style={{ padding: 16, paddingTop: 8 }}>
            <Button testID="confirm-payment" label={isBank ? t('common.confirm') : t('pay.confirm')} onPress={() => (ready ? void process(method) : toast.show(t('pay.wrongPin'), 'error'))} />
          </View>
        }
      >
        <View style={{ gap: 18 }}>
          <View style={{ backgroundColor: color, borderRadius: radii.card, padding: 20, gap: 6 }}>
            <Text style={{ color: '#fff', opacity: 0.85 }}>{label}</Text>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700', lineHeight: 38 }}>{formatPeso(order.total)}</Text>
            <Text style={{ color: '#fff', opacity: 0.8, fontSize: 12 }}>{order.title}</Text>
          </View>
          {isBank ? (
            <Card style={{ gap: 8 }}>
              <Text variant="caption">{t('pay.receiptRef')}</Text>
              <Text variant="title" selectable>
                AL-{order.id.slice(-8).toUpperCase()}
              </Text>
              <Text variant="caption">{t('pay.demoNote')}</Text>
            </Card>
          ) : (
            <>
              <Input label={t('pay.mobile')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" returnKeyType="done" />
              <Text variant="label" center color="muted">
                {t('pay.mpin')}
              </Text>
              <MpinKeypad value={pin} onChange={setPin} />
              <Text variant="caption" center>
                {t('pay.demoNote')}
              </Text>
            </>
          )}
        </View>
      </KeyboardScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('pay.title')} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Card style={{ alignItems: 'center', gap: 4 }}>
          <Text variant="caption">{order.title}</Text>
          <Text variant="display">{formatPeso(order.total)}</Text>
        </Card>
        <Text variant="label" color="muted">
          {t('pay.choose')}
        </Text>
        {methods.map((m) => {
          const active = method === m.id;
          return (
            <Pressable key={m.id} testID={`method-${m.id}`} onPress={() => setMethod(m.id)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radii.card, borderWidth: 2, borderColor: active ? colors.eyebrow : colors.border, backgroundColor: active ? colors.sectionGreen : colors.surface }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>{m.icon}</View>
                <Text variant="subtitle" style={{ flex: 1, fontSize: 15.5 }}>
                  {m.label}
                </Text>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: active ? colors.eyebrow : colors.border, backgroundColor: active ? colors.eyebrow : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {active ? <Check size={14} color="#1F1E1B" strokeWidth={3} /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}
        <Text variant="caption" center>
          {t('pay.demoNote')}
        </Text>
        <Button testID="continue-pay" label={t('common.continue')} onPress={choose} />
      </ScrollView>
    </View>
  );
}
