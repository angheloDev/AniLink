import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { IconButton } from './IconButton';
import { Text } from './Text';

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  noBack?: boolean;
  /** Add the top safe-area inset (use when the screen is not inside KeyboardScreen). */
  safeTop?: boolean;
}

export function ScreenHeader({ title, subtitle, right, onBack, noBack, safeTop = true }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: safeTop ? insets.top + 8 : 8, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: colors.bg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {noBack ? null : (
        <IconButton label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}>
          <ArrowLeft size={20} color={colors.text} />
        </IconButton>
      )}
      <View style={{ flex: 1 }}>
        {title ? (
          <Text variant="subtitle" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
