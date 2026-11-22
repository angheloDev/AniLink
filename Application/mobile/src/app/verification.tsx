import { Image } from 'expo-image';
import { BadgeCheck, Camera, IdCard, Sprout } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, uploadImages } from '../api/client';
import { submitVerification } from '../api/endpoints';
import { assetUrl } from '../api/server';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LogoLoader } from '../components/LogoLoader';
import { ScreenHeader } from '../components/ScreenHeader';
import { Text } from '../components/Text';
import { useToast } from '../components/Toast';
import { pickImages } from '../lib/pickImage';
import { onSocket } from '../socket';
import { useAuth, useCurrentUser } from '../store/auth';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

function PhotoSlot({ label, uri, onPress, icon, testID }: { label: string; uri: string | null; onPress: () => void; icon: React.ReactNode; testID: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable testID={testID} onPress={onPress} style={{ flex: 1 }}>
      <View style={{ height: 140, borderRadius: radii.card, borderWidth: 1.5, borderStyle: uri ? 'solid' : 'dashed', borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {uri ? (
          <Image source={{ uri: assetUrl(uri) ?? undefined }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <>
            {icon}
            <Text variant="caption">{t('verification.tapToAdd')}</Text>
          </>
        )}
      </View>
      <Text variant="label" center style={{ marginTop: 8 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Verification facade: the farmer "uploads" an ID and a farm photo; the server auto-approves
 * after about 30 seconds and sends a notification, then the verified badge appears everywhere.
 */
export default function Verification() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const user = useCurrentUser();
  const status = user.verification.status;
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [farmPhoto, setFarmPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pick up the approval as soon as the server announces it, with a slow poll as a backup.
  useEffect(() => {
    if (status !== 'pending') return;
    const off = onSocket('notification:new', ({ notification }: { notification: { type: string } }) => {
      if (notification.type === 'verification') void useAuth.getState().refreshMe();
    });
    const poll = setInterval(() => void useAuth.getState().refreshMe(), 6000);
    return () => {
      off();
      clearInterval(poll);
    };
  }, [status]);

  async function pick(setter: (u: string) => void) {
    const [uri] = await pickImages();
    if (uri) setter(uri);
  }

  async function submit() {
    if (!idPhoto || !farmPhoto) return toast.show(t('verification.uploadFirst'), 'error');
    setLoading(true);
    try {
      const [idUrl, farmUrl] = await uploadImages([idPhoto, farmPhoto]);
      const { user: u } = await submitVerification({ idPhotoUrl: idUrl, farmPhotoUrl: farmUrl });
      useAuth.getState().setUser(u);
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('verification.title')} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {status === 'verified' ? (
          <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 36 }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.sectionGreen, alignItems: 'center', justifyContent: 'center' }}>
              <BadgeCheck size={52} color={colors.eyebrow} />
            </View>
            <Text variant="title" center testID="verified-title">
              {t('verification.verifiedTitle')}
            </Text>
            <Text color="muted" center>
              {t('verification.verifiedBody')}
            </Text>
          </Card>
        ) : status === 'pending' ? (
          <Card style={{ alignItems: 'center', gap: 16, paddingVertical: 36 }}>
            <LogoLoader size={72} />
            <Text variant="title" center testID="pending-title">
              {t('verification.pendingTitle')}
            </Text>
            <Text color="muted" center>
              {t('verification.pendingBody')}
            </Text>
          </Card>
        ) : (
          <>
            <Text color="muted">{t('verification.intro')}</Text>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <PhotoSlot testID="pick-id" label={t('verification.idPhoto')} uri={idPhoto} onPress={() => void pick(setIdPhoto)} icon={<IdCard size={30} color={colors.eyebrow} />} />
              <PhotoSlot testID="pick-farm" label={t('verification.farmPhoto')} uri={farmPhoto} onPress={() => void pick(setFarmPhoto)} icon={<Sprout size={30} color={colors.eyebrow} />} />
            </View>
            <Button testID="submit-verification" label={t('verification.submit')} icon={<Camera size={18} color={colors.primaryText} />} loading={loading} disabled={!idPhoto || !farmPhoto} onPress={submit} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
