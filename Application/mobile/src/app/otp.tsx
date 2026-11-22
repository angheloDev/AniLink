import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { otpRequest, otpVerify, patchMe } from '../api/endpoints';
import { KeyboardScreen } from '../components/KeyboardScreen';
import { OtpInput } from '../components/OtpInput';
import { AuthHeader } from '../components/AuthHeader';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { presentLocal } from '../lib/notifications';
import { useAuth } from '../store/auth';

/** Phone verification facade: the 6-digit code arrives as a system notification from this device. */
export default function Otp() {
  const { phone = '' } = useLocalSearchParams<{ phone?: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const request = useCallback(async () => {
    try {
      const r = await otpRequest(String(phone));
      const shown = await presentLocal({ title: 'AniLink', body: t('auth.codeNotification', { code: r.code }) });
      setHint(shown ? null : r.code);
      setCooldown(30);
    } catch {
      toast.show(t('auth.errNetwork'), 'error');
    }
  }, [phone, t, toast]);

  useEffect(() => {
    void request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function verify(value = code) {
    if (value.length !== 6) return toast.show(t('auth.otpFailed'), 'error');
    setLoading(true);
    try {
      await otpVerify(String(phone), value);
      const { user } = await patchMe({ phone: String(phone) });
      useAuth.getState().setUser(user);
      toast.show(t('common.verified'), 'success');
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError && e.status === 400 ? t('auth.otpFailed') : t('common.error'), 'error');
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen header={<AuthHeader />}>
      <View style={{ gap: 8, marginTop: 8, marginBottom: 28 }}>
        <Text variant="display">{t('auth.otpTitle')}</Text>
        <Text variant="body" color="muted">
          {t('auth.otpSub', { phone: String(phone) })}
        </Text>
      </View>
      <View style={{ gap: 18 }}>
        <OtpInput value={code} onChange={setCode} onComplete={verify} />
        {hint ? (
          <Text variant="caption" center>
            Demo code: {hint}
          </Text>
        ) : null}
        <Button label={t('auth.verify')} loading={loading} onPress={() => verify()} />
        <Pressable disabled={cooldown > 0} onPress={request} style={{ alignItems: 'center', padding: 10, opacity: cooldown > 0 ? 0.5 : 1 }}>
          <Text variant="label" color="eyebrow">
            {cooldown > 0 ? `${t('auth.resend')} (${cooldown}s)` : t('auth.resend')}
          </Text>
        </Pressable>
      </View>
    </KeyboardScreen>
  );
}
