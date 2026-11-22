import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { tap } from '../lib/haptics';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, style, testID = 'button' }: Props) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.primary, fg: colors.primaryText, border: colors.primary },
    accent: { bg: colors.accent, fg: '#1F1E1B', border: colors.accent },
    ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];
  const inactive = loading || disabled;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={() => {
        if (inactive) return;
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border, height: size === 'md' ? 52 : 40, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator testID="button-spinner" color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={{ fontFamily: fonts.semibold, fontSize: size === 'md' ? 15.5 : 13.5, color: palette.fg }}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.button, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
