import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, NetworkError, uploadImages } from '../../api/client';
import { patchMe } from '../../api/endpoints';
import { Avatar } from '../../components/Avatar';
import { BarangayPicker } from '../../components/BarangayPicker';
import { Button } from '../../components/Button';
import { Input, type InputRef } from '../../components/Input';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { AuthHeader } from '../../components/AuthHeader';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { pickImages } from '../../lib/pickImage';
import { useAuth, useCurrentUser } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const user = useCurrentUser();
  const [name, setName] = useState(user.name);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.photoUrl);
  const [barangay, setBarangay] = useState<string | null>(user.barangay);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; barangay?: string }>({});
  const phoneRef = useRef<InputRef>(null);
  const isFarmer = user.role === 'farmer';

  async function choosePhoto() {
    const [uri] = await pickImages({ square: true });
    if (!uri) return;
    setUploading(true);
    try {
      const [url] = await uploadImages([uri]);
      setPhotoUrl(url);
    } catch {
      toast.show(t('common.error'), 'error');
    } finally {
      setUploading(false);
    }
  }

  async function next() {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = t('auth.errRequired');
    if (!barangay) errs.barangay = t('auth.errRequired');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { user: u } = await patchMe({ name: name.trim(), barangay: barangay!, ...(photoUrl ? { photoUrl } : {}), ...(phone.trim() ? { phone: phone.trim() } : {}), ...(isFarmer ? {} : { onboarded: true }) });
      useAuth.getState().setUser(u);
      if (isFarmer) router.push('/(onboarding)/farm');
      else router.replace('/');
    } catch (e) {
      toast.show(e instanceof NetworkError ? t('auth.errNetwork') : e instanceof ApiError ? e.message : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen header={<AuthHeader />} footer={<View style={{ padding: 20, paddingTop: 8 }}><Button testID="profile-continue" label={isFarmer ? t('common.continue') : t('onboarding.finish')} loading={loading} onPress={next} /></View>}>
      <View style={{ gap: 6, marginBottom: 20 }}>
        <Text variant="eyebrow">2 / {isFarmer ? 3 : 2}</Text>
        <Text variant="display">{t('onboarding.profileTitle')}</Text>
      </View>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Pressable testID="pick-photo" onPress={choosePhoto} accessibilityLabel={t('onboarding.addPhoto')}>
          <Avatar name={name || user.name} uri={photoUrl} size={104} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg }}>
            <Camera size={16} color="#1F1E1B" />
          </View>
        </Pressable>
        <Text variant="caption" style={{ marginTop: 8 }}>
          {uploading ? t('common.loading') : t('onboarding.addPhoto')}
        </Text>
      </View>
      <View style={{ gap: 14 }}>
        <Input label={t('onboarding.name')} value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => phoneRef.current?.focus()} error={errors.name} />
        <BarangayPicker label={t('onboarding.barangay')} value={barangay} onChange={setBarangay} error={errors.barangay} />
        <Input ref={phoneRef} label={`${t('auth.phone')} (${t('common.optional')})`} value={phone} onChangeText={setPhone} keyboardType="phone-pad" returnKeyType="done" placeholder="09XX XXX XXXX" />
        {phone.trim().length >= 10 ? (
          <Pressable onPress={() => router.push({ pathname: '/otp', params: { phone: phone.trim() } })}>
            <Text variant="label" color="eyebrow">
              {t('auth.verify')} {phone.trim()}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </KeyboardScreen>
  );
}
