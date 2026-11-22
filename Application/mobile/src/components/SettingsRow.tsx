import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  label: string;
  icon?: React.ReactNode;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  testID?: string;
}

export function SettingsRow({ label, icon, value, onPress, right, danger, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 56, backgroundColor: pressed ? colors.card : 'transparent' })}
    >
      {icon ? <View style={{ width: 28, alignItems: 'center' }}>{icon}</View> : null}
      <Text style={{ flex: 1 }} color={danger ? 'danger' : 'text'}>
        {label}
      </Text>
      {value ? (
        <Text variant="caption" numberOfLines={1} style={{ maxWidth: 140 }}>
          {value}
        </Text>
      ) : null}
      {right ?? (onPress ? <ChevronRight size={18} color={colors.muted} /> : null)}
    </Pressable>
  );
}

export function SettingsGroup({ children, title }: { children: React.ReactNode; title?: string }) {
  const { colors } = useTheme();
  const items = React.Children.toArray(children);
  return (
    <View style={{ gap: 8 }}>
      {title ? (
        <Text variant="eyebrow" style={{ marginLeft: 6 }}>
          {title}
        </Text>
      ) : null}
      <View style={{ borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
        {items.map((c, i) => (
          <View key={i} style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
            {c}
          </View>
        ))}
      </View>
    </View>
  );
}
