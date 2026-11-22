import { router } from 'expo-router';
import { BadgeCheck, Bell, Heart, LineChart, LogOut, Package, Pencil, Settings, Sprout, Repeat } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { patchMe } from '../../api/endpoints';
import { queryClient } from '../../api/hooks';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { NotificationBell } from '../../components/NotificationBell';
import { SettingsGroup, SettingsRow } from '../../components/SettingsRow';
import { Stars } from '../../components/Stars';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../lib/format';
import { useAuth, useCurrentUser } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function Profile() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const user = useCurrentUser();
  const [switching, setSwitching] = useState(false);
  const farmer = user.role === 'farmer';
  const next = farmer ? 'buyer' : 'farmer';

  async function switchRole() {
    setSwitching(true);
    try {
      const { user: u } = await patchMe({ role: next });
      useAuth.getState().setUser(u);
      void queryClient.invalidateQueries();
    } catch {
      toast.show(t('common.error'), 'error');
    } finally {
      setSwitching(false);
    }
  }

  function logout() {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await useAuth.getState().signOut();
          queryClient.clear();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  const verification = user.verification.status;
  return (
    <ScrollView testID="profile" style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40, gap: 20 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="display" style={{ fontSize: 30, lineHeight: 38 }}>
          {t('profile.title')}
        </Text>
        <NotificationBell />
      </View>

      <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
        <Avatar name={user.name} uri={user.photoUrl} size={92} verified={verification === 'verified'} />
        <Text variant="title">{user.name}</Text>
        <Text variant="caption">{user.email}</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge label={farmer ? t('profile.farmerMode') : t('profile.buyerMode')} tone={farmer ? 'accent' : 'success'} />
          {user.barangay ? <Badge label={user.barangay} /> : null}
          {verification === 'verified' ? <Badge label={t('common.verified')} tone="success" /> : null}
        </View>
        {user.ratingCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Stars rating={user.ratingAvg} size={15} />
            <Text variant="caption">{t('listing.ratingCount', { avg: user.ratingAvg.toFixed(1), count: user.ratingCount })}</Text>
          </View>
        ) : null}
        <Text variant="caption">{t('profile.memberSince', { date: formatDate(user.createdAt) })}</Text>
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Repeat size={22} color={colors.eyebrow} />
          <Text variant="caption" style={{ flex: 1 }}>
            {t('profile.switchHint')}
          </Text>
        </View>
        <Button testID="switch-role" variant="ghost" label={t('profile.switchTo', { role: next === 'farmer' ? t('profile.farmerRole') : t('profile.buyerRole') })} loading={switching} onPress={switchRole} />
      </Card>

      <SettingsGroup>
        {farmer ? <SettingsRow testID="row-my-listings" label={t('profile.myListings')} icon={<Sprout size={20} color={colors.eyebrow} />} onPress={() => router.push('/my-listings')} /> : null}
        <SettingsRow testID="row-orders" label={t('profile.orders')} icon={<Package size={20} color={colors.eyebrow} />} onPress={() => router.push('/orders')} />
        <SettingsRow testID="row-favorites" label={t('profile.favorites')} icon={<Heart size={20} color={colors.eyebrow} />} onPress={() => router.push('/favorites')} />
        <SettingsRow testID="row-alerts" label={t('profile.alerts')} icon={<Bell size={20} color={colors.eyebrow} />} onPress={() => router.push('/alerts')} />
        <SettingsRow testID="row-price-guide" label={t('profile.priceGuide')} icon={<LineChart size={20} color={colors.eyebrow} />} onPress={() => router.push('/price-guide')} />
        {farmer ? (
          <SettingsRow
            testID="row-verification"
            label={t('profile.verification')}
            icon={<BadgeCheck size={20} color={verification === 'verified' ? colors.eyebrow : colors.muted} />}
            value={verification === 'verified' ? t('common.verified') : verification === 'pending' ? t('verification.pendingTitle') : t('verification.notVerified')}
            onPress={() => router.push('/verification')}
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow testID="row-edit-profile" label={t('profile.editProfile')} icon={<Pencil size={20} color={colors.muted} />} onPress={() => router.push('/edit-profile')} />
        <SettingsRow testID="row-settings" label={t('profile.settings')} icon={<Settings size={20} color={colors.muted} />} onPress={() => router.push('/settings')} />
        <SettingsRow testID="row-logout" label={t('profile.logout')} icon={<LogOut size={20} color={colors.danger} />} danger onPress={logout} />
      </SettingsGroup>
    </ScrollView>
  );
}
