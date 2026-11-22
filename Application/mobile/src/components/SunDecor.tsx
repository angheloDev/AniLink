import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

/** The yellow "sun" accent circle from the Fieldlink-inspired look. */
export function SunDecor({ size = 120, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: colors.sun }, style]} />;
}
