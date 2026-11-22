import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { patchMe } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ItemPicker } from '../../components/ItemPicker';
import { KeyboardScreen } from '../../components/KeyboardScreen';
import { AuthHeader } from '../../components/AuthHeader';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { useAuth, useCurrentUser } from '../../store/auth';

const SUGGESTED = ['Tomato', 'Eggplant', 'Pechay', 'Mango', 'Banana', 'Camote', 'Rice', 'Coconut', 'Seaweed', 'Eggs', 'Crafts', 'Cassava'];

export default function FarmSetup() {
  const { t } = useTranslation();
  const toast = useToast();
  const user = useCurrentUser();
  const [farmName, setFarmName] = useState(user.farm?.name ?? '');
  const [description, setDescription] = useState(user.farm?.description ?? '');
  const [crops, setCrops] = useState<string[]>(user.farm?.crops ?? []);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      const { user: u } = await patchMe({ farm: { name: farmName.trim() || `${user.name}'s Farm`, description: description.trim(), crops }, onboarded: true });
      useAuth.getState().setUser(u);
      router.replace('/');
    } catch {
      toast.show(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen header={<AuthHeader />} footer={<View style={{ padding: 20, paddingTop: 8 }}><Button testID="farm-finish" label={t('onboarding.finish')} loading={loading} onPress={finish} /></View>}>
      <View style={{ gap: 6, marginBottom: 20 }}>
        <Text variant="eyebrow">3 / 3</Text>
        <Text variant="display">{t('onboarding.farmTitle')}</Text>
      </View>
      <View style={{ gap: 14 }}>
        <Input label={t('onboarding.farmName')} value={farmName} onChangeText={setFarmName} autoCapitalize="words" returnKeyType="next" />
        <Input label={t('onboarding.farmDesc')} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <ItemPicker label={t('onboarding.crops')} suggestions={SUGGESTED} value={crops} onChange={setCrops} />
      </View>
    </KeyboardScreen>
  );
}
