import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface Props extends ViewProps {
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ padded = true, style, children, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[{ backgroundColor: colors.surface, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, padding: padded ? 16 : 0, overflow: 'hidden' }, style]}
    >
      {children}
    </View>
  );
}
