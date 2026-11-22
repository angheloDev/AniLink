import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { GoogleSignIn } from '../../components/GoogleSignIn';
import { IconButton } from '../../components/IconButton';
import { LanguageToggle } from '../../components/LanguageToggle';
import { SunDecor } from '../../components/SunDecor';
import { Text } from '../../components/Text';
import { useTheme } from '../../theme/useTheme';

const mark = require('../../../assets/logos/mark.png');

export default function Welcome() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
      <SunDecor size={190} style={{ top: -50, right: -60, opacity: 0.95 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <LanguageToggle />
        <IconButton testID="server-settings-button" label={t('common.serverAddress')} onPress={() => router.push('/server-settings')}>
          <Settings size={20} color={colors.text} />
        </IconButton>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Image source={mark} style={{ width: 84, height: 84, marginBottom: 28 }} resizeMode="contain" />
        <Text variant="eyebrow" style={{ marginBottom: 14 }}>
          {t('auth.eyebrow')}
        </Text>
        <Text variant="display" style={{ fontSize: 40, lineHeight: 48 }}>
          {t('auth.headline1')}
        </Text>
        <Text variant="display" color="accent" style={{ fontSize: 40, lineHeight: 48 }}>
          {t('auth.headline2')}
        </Text>
        <Text variant="body" color="muted" style={{ marginTop: 16, maxWidth: 340 }}>
          {t('auth.subtitle')}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Button testID="get-started" label={t('auth.getStarted')} onPress={() => router.push('/(auth)/signup')} />
        <Button testID="log-in" variant="ghost" label={t('auth.logIn')} onPress={() => router.push('/(auth)/login')} />
        <GoogleSignIn />
      </View>
    </View>
  );
}
