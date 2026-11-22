import React from 'react';
import { Pressable, View } from 'react-native';
import { tap } from '../lib/haptics';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  emoji?: string;
  icon?: React.ReactNode;
  testID?: string;
}

export function Chip({ label, selected, onPress, emoji, icon, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        height: 40,
        borderRadius: radii.chip,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {emoji ? <Text style={{ fontSize: 15 }}>{emoji}</Text> : null}
        {icon}
        <Text style={{ fontFamily: fonts.medium, fontSize: 13.5, color: selected ? colors.primaryText : colors.text }}>{label}</Text>
      </View>
    </Pressable>
  );
}
