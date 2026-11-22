import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, NetworkError } from '../../api/client';
import { register } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { GoogleSignIn } from '../../components/GoogleSignIn';
import { Input, type InputRef } from '../../components/Input';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { AuthHeader } from '../../components/AuthHeader';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { validateCredentials, type CredentialErrors } from '../../lib/validate';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function Signup() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);

  async function submit() {
    const errs = validateCredentials({ name, email, password }, { requireName: true });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      // The role is chosen in onboarding; everyone starts as a buyer.
      const s = await register({ name: name.trim(), email: email.trim(), password, role: 'buyer' });
      await useAuth.getState().signIn(s.token, s.user);
      router.replace('/');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setErrors({ email: 'auth.errEmailTaken' });
      else toast.show(e instanceof NetworkError ? t('auth.errNetwork') : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen header={<AuthHeader />}>
      <View style={{ gap: 6, marginTop: 8, marginBottom: 24 }}>
        <Text variant="eyebrow">{t('auth.eyebrow')}</Text>
        <Text variant="display">{t('auth.signUp')}</Text>
      </View>
      <View style={{ gap: 14 }}>
        <Input
          label={t('auth.name')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
          error={errors.name ? t(errors.name) : null}
        />
        <Input
          ref={emailRef}
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email ? t(errors.email) : null}
        />
        <Input
          ref={passwordRef}
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={submit}
          error={errors.password ? t(errors.password) : null}
          right={
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={10} accessibilityLabel="Show password">
              {show ? <EyeOff size={20} color={colors.muted} /> : <Eye size={20} color={colors.muted} />}
            </Pressable>
          }
        />
        <Button testID="submit-signup" label={t('auth.signUp')} loading={loading} onPress={submit} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text variant="caption">{t('auth.or')}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <GoogleSignIn />
        <Text variant="caption" center style={{ marginTop: 4 }}>
          {t('auth.terms')}
        </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')} style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Text variant="body" color="muted">
            {t('auth.haveAccount')} <Text variant="label" color="eyebrow">{t('auth.logIn')}</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardScreen>
  );
}
