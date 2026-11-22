import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { tap } from '../lib/haptics';
import { useTheme } from '../theme/useTheme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  filled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function IconButton({ children, onPress, size = 40, filled = true, label, style, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: filled ? colors.surface : 'transparent', borderWidth: filled ? 1 : 0, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
