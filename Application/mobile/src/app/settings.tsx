import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Bell, CircleHelp, Globe, Info, Moon, Server, Sun, Smartphone } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { patchMe } from '../api/endpoints';
import { getCachedServerUrl } from '../api/server';
import { Chip } from '../components/Chip';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingsGroup, SettingsRow } from '../components/SettingsRow';
import { Text } from '../components/Text';
import { setLanguage, type Language } from '../i18n';
import { useAuth } from '../store/auth';
import { useNotifPrefs } from '../store/prefs';
import { type ThemeMode } from '../theme/ThemeProvider';
import { useTheme } from '../theme/useTheme';

function Toggle({ value, onChange, testID }: { value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  const { colors } = useTheme();
  return <Switch testID={testID} value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={value ? colors.eyebrow : colors.muted} />;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, mode, setMode } = useTheme();
  const prefs = useNotifPrefs((s) => s.prefs);
  const setPref = useNotifPrefs((s) => s.set);

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'system', label: t('settings.themeSystem'), icon: <Smartphone size={15} color={mode === 'system' ? colors.primaryText : colors.muted} /> },
    { id: 'dark', label: t('settings.themeDark'), icon: <Moon size={15} color={mode === 'dark' ? colors.primaryText : colors.muted} /> },
    { id: 'light', label: t('settings.themeLight'), icon: <Sun size={15} color={mode === 'light' ? colors.primaryText : colors.muted} /> },
  ];

  async function changeLanguage(l: Language) {
    await setLanguage(l);
    if (useAuth.getState().token) void patchMe({ language: l }).catch(() => undefined);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 22 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          <Text variant="eyebrow" style={{ marginLeft: 6 }}>
            {t('settings.appearance')}
          </Text>
          <View style={{ gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
            <Text variant="label">{t('settings.theme')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {modes.map((m) => (
                <Chip key={m.id} testID={`theme-${m.id}`} label={m.label} icon={m.icon} selected={mode === m.id} onPress={() => void setMode(m.id)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Globe size={16} color={colors.muted} />
              <Text variant="label">{t('settings.language')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip testID="language-en" label={t('settings.english')} selected={i18n.language === 'en'} onPress={() => void changeLanguage('en')} />
              <Chip testID="language-tl" label={t('settings.tagalog')} selected={i18n.language === 'tl'} onPress={() => void changeLanguage('tl')} />
            </View>
          </View>
        </View>

        <SettingsGroup title={t('settings.notifications')}>
          <SettingsRow label={t('settings.notifMessages')} icon={<Bell size={18} color={colors.eyebrow} />} right={<Toggle testID="pref-messages" value={prefs.messages} onChange={(v) => setPref({ messages: v })} />} />
          <SettingsRow label={t('settings.notifOffers')} icon={<Bell size={18} color={colors.eyebrow} />} right={<Toggle testID="pref-offers" value={prefs.offers} onChange={(v) => setPref({ offers: v })} />} />
          <SettingsRow label={t('settings.notifOrders')} icon={<Bell size={18} color={colors.eyebrow} />} right={<Toggle testID="pref-orders" value={prefs.orders} onChange={(v) => setPref({ orders: v })} />} />
          <SettingsRow label={t('settings.notifAlerts')} icon={<Bell size={18} color={colors.eyebrow} />} right={<Toggle testID="pref-alerts" value={prefs.alerts} onChange={(v) => setPref({ alerts: v })} />} />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow testID="row-server" label={t('settings.server')} icon={<Server size={18} color={colors.muted} />} value={getCachedServerUrl().replace(/^https?:\/\//, '')} onPress={() => router.push('/server-settings')} />
          <SettingsRow testID="row-help" label={t('settings.help')} icon={<CircleHelp size={18} color={colors.muted} />} onPress={() => router.push('/help')} />
          <SettingsRow label={t('settings.about')} icon={<Info size={18} color={colors.muted} />} value={t('settings.version', { v: Constants.expoConfig?.version ?? '1.0.0' })} />
        </SettingsGroup>
        <Text variant="caption" center>
          {t('settings.aboutBody')}
        </Text>
      </ScrollView>
    </View>
  );
}
