import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, uploadImages } from '../api/client';
import { patchMe } from '../api/endpoints';
import { Avatar } from '../components/Avatar';
import { BarangayPicker } from '../components/BarangayPicker';
import { Button } from '../components/Button';
import { Input, type InputRef } from '../components/Input';
import { KeyboardScreen } from '../components/KeyboardScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Text } from '../components/Text';
import { useToast } from '../components/Toast';
import { pickImages } from '../lib/pickImage';
import { useAuth, useCurrentUser } from '../store/auth';
import { useTheme } from '../theme/useTheme';

export default function EditProfile() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const user = useCurrentUser();
  const [name, setName] = useState(user.name);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.photoUrl);
  const [barangay, setBarangay] = useState<string | null>(user.barangay);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [farmName, setFarmName] = useState(user.farm?.name ?? '');
  const [farmDesc, setFarmDesc] = useState(user.farm?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneRef = useRef<InputRef>(null);
  const farmer = user.role === 'farmer';

  async function changePhoto() {
    const [uri] = await pickImages({ square: true });
    if (!uri) return;
    try {
      const [url] = await uploadImages([uri]);
      setPhotoUrl(url);
    } catch {
      toast.show(t('common.error'), 'error');
    }
  }

  async function save() {
    if (!name.trim()) return setError(t('auth.errRequired'));
    setError(null);
    setLoading(true);
    try {
      const { user: u } = await patchMe({
        name: name.trim(),
        ...(photoUrl ? { photoUrl } : {}),
        ...(barangay ? { barangay } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(farmer ? { farm: { name: farmName.trim(), description: farmDesc.trim(), crops: user.farm?.crops ?? [] } } : {}),
      });
      useAuth.getState().setUser(u);
      toast.show(t('profile.updated'), 'success');
      router.back();
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen
      header={<ScreenHeader title={t('profile.editProfile')} />}
      footer={
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Button testID="save-profile" label={t('common.save')} loading={loading} onPress={save} />
        </View>
      }
    >
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Pressable onPress={changePhoto}>
          <Avatar name={name || user.name} uri={photoUrl} size={104} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg }}>
            <Camera size={16} color="#1F1E1B" />
          </View>
        </Pressable>
        <Text variant="caption" style={{ marginTop: 8 }}>
          {t('onboarding.addPhoto')}
        </Text>
      </View>
      <View style={{ gap: 14 }}>
        <Input label={t('onboarding.name')} value={name} onChangeText={setName} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => phoneRef.current?.focus()} error={error} />
        <Input ref={phoneRef} label={t('auth.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" returnKeyType="done" />
        <BarangayPicker label={t('onboarding.barangay')} value={barangay} onChange={setBarangay} />
        {farmer ? (
          <>
            <Input label={t('onboarding.farmName')} value={farmName} onChangeText={setFarmName} autoCapitalize="words" returnKeyType="next" />
            <Input label={t('onboarding.farmDesc')} value={farmDesc} onChangeText={setFarmDesc} multiline numberOfLines={3} />
          </>
        ) : null}
      </View>
    </KeyboardScreen>
  );
}
