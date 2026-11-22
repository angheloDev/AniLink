import { BadgeCheck } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

type Tone = 'neutral' | 'success' | 'accent' | 'sun' | 'danger';

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: React.ReactNode }) {
  const { colors } = useTheme();
  const map = {
    neutral: { bg: colors.card, fg: colors.text },
    success: { bg: colors.sectionGreen, fg: colors.eyebrow },
    accent: { bg: colors.accent, fg: '#1F1E1B' },
    sun: { bg: colors.sun, fg: '#1F1E1B' },
    danger: { bg: colors.danger, fg: '#FFFFFF' },
  }[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: map.bg, paddingHorizontal: 10, height: 26, borderRadius: 999 }}>
      {icon}
      <Text variant="caption" style={{ color: map.fg, fontSize: 11.5, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

export function VerifiedMark({ size = 16 }: { size?: number }) {
  const { colors } = useTheme();
  return <BadgeCheck size={size} color={colors.eyebrow} fill={colors.sectionGreen} />;
}
