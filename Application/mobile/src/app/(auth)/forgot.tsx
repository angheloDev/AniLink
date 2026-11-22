import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, NetworkError } from '../../api/client';
import { forgotPassword, resetPassword } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { OtpInput } from '../../components/OtpInput';
import { AuthHeader } from '../../components/AuthHeader';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { isEmail } from '../../lib/validate';
import { presentLocal } from '../../lib/notifications';

export default function Forgot() {
  const { t } = useTranslation();
  const toast = useToast();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    if (!isEmail(email)) return setError(t('auth.errInvalidEmail'));
    setError(null);
    setLoading(true);
    try {
      const r = await forgotPassword(email.trim());
      const shown = await presentLocal({ title: 'AniLink', body: t('auth.codeNotification', { code: r.code }) });
      // If the system notification could not be shown (permission denied), reveal the demo code on screen.
      setHint(shown ? null : r.code);
      setStep('code');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof NetworkError ? t('auth.errNetwork') : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    if (code.length !== 6) return setError(t('auth.otpFailed'));
    if (password.length < 6) return setError(t('auth.errShortPassword'));
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ email: email.trim(), code, password });
      toast.show(t('auth.resetDone'), 'success');
      router.replace('/(auth)/login');
    } catch (e) {
      setError(e instanceof ApiError ? (e.status === 400 ? t('auth.otpFailed') : e.message) : t('auth.errNetwork'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen header={<AuthHeader />}>
      <View style={{ gap: 8, marginTop: 8, marginBottom: 24 }}>
        <Text variant="display">{t('auth.resetTitle')}</Text>
        <Text variant="body" color="muted">
          {step === 'email' ? t('auth.resetSub') : t('auth.otpSub', { phone: email })}
        </Text>
      </View>
      {step === 'email' ? (
        <View style={{ gap: 14 }}>
          <Input label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" returnKeyType="send" onSubmitEditing={sendCode} error={error} />
          <Button label={t('auth.sendCode')} loading={loading} onPress={sendCode} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <OtpInput value={code} onChange={setCode} />
          {hint ? (
            <Text variant="caption" center>
              Demo code: {hint}
            </Text>
          ) : null}
          <Input label={t('auth.newPassword')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" returnKeyType="go" onSubmitEditing={reset} error={error} />
          <Button label={t('auth.resetTitle')} loading={loading} onPress={reset} />
        </View>
      )}
    </KeyboardScreen>
  );
}
