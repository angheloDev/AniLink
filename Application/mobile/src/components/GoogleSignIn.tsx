import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { googleDemo } from '../api/endpoints';
import { ApiError } from '../api/client';
import { initials, } from '../lib/format';
import { isEmail } from '../lib/validate';
import { useAuth } from '../store/auth';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Button } from './Button';
import { Input } from './Input';
import { LogoLoader } from './LogoLoader';
import { Sheet } from './Sheet';
import { Text } from './Text';
import { useToast } from './Toast';

const DEMO_ACCOUNTS = [
  { name: 'Carla Mendoza', email: 'carla.mendoza@gmail.com', color: '#E8834A' },
  { name: 'Rico Dela Cruz', email: 'rico.delacruz@gmail.com', color: '#4285F4' },
  { name: 'Maria Santos', email: 'maria.santos.zbo@gmail.com', color: '#6FBF8E' },
];

function GoogleG({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: size * 0.68, color: '#4285F4', lineHeight: size * 0.95 }}>G</Text>
    </View>
  );
}

/**
 * "Continue with Google" facade: a Google-style account chooser that signs into a local demo account.
 * No real Google OAuth happens; the server just finds or creates a user for the chosen email.
 */
export function GoogleSignIn() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [other, setOther] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function pick(a: { name: string; email: string }) {
    setOpen(false);
    setOther(false);
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1300));
      const s = await googleDemo({ name: a.name, email: a.email });
      await useAuth.getState().signIn(s.token, s.user);
      router.replace('/');
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('auth.errNetwork'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button testID="google-button" variant="ghost" label={t('auth.continueGoogle')} icon={<GoogleG />} onPress={() => setOpen(true)} />
      <Sheet visible={open} onClose={() => { setOpen(false); setOther(false); }} title={t('auth.chooseAccount')}>
        <Text variant="caption" style={{ marginTop: -8, marginBottom: 12 }}>
          {t('auth.googleSub')}
        </Text>
        {other ? (
          <View style={{ gap: 12 }}>
            <Input label={t('auth.name')} value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" />
            <Input label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" returnKeyType="done" />
            <Button label={t('common.continue')} disabled={!name.trim() || !isEmail(email)} onPress={() => pick({ name: name.trim(), email: email.trim() })} />
          </View>
        ) : (
          <View>
            {DEMO_ACCOUNTS.map((a) => (
              <Pressable
                key={a.email}
                testID={`google-account-${a.email}`}
                onPress={() => pick(a)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: a.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.semibold, color: '#1F1E1B' }}>{initials(a.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{a.name}</Text>
                  <Text variant="caption">{a.email}</Text>
                </View>
              </Pressable>
            ))}
            <Pressable onPress={() => setOther(true)} style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 }}>
              <Text variant="label" color="eyebrow">
                {t('auth.useAnother')}
              </Text>
            </Pressable>
          </View>
        )}
      </Sheet>
      <Modal visible={busy} transparent animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.surface, padding: 28, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
            <LogoLoader label={t('common.loading')} />
          </View>
        </View>
      </Modal>
    </>
  );
}
