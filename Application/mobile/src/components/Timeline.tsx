import { Check } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatChatTime, formatDate } from '../lib/format';
import type { TimelineStep } from '../lib/orderTimeline';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { statusColor } from './StatusChip';
import { Text } from './Text';

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View testID="timeline">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const tone = statusColor(colors, s.status);
        const filled = s.state !== 'upcoming';
        return (
          <View key={s.status} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center', width: 26 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: filled ? tone : 'transparent',
                  borderWidth: 2,
                  borderColor: filled ? tone : colors.border,
                }}
              >
                {s.state === 'done' ? <Check size={15} color="#1F1E1B" strokeWidth={3} /> : s.state === 'current' ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1F1E1B' }} /> : null}
              </View>
              {!last ? <View style={{ flex: 1, width: 2, minHeight: 26, backgroundColor: s.state === 'done' ? tone : colors.border }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 18 }}>
              <Text style={{ fontFamily: s.state === 'current' ? fonts.semibold : fonts.regular, color: s.state === 'upcoming' ? colors.muted : colors.text }}>{t(`order.status.${s.status}`)}</Text>
              {s.at ? (
                <Text variant="caption">
                  {formatDate(s.at)} · {formatChatTime(s.at)}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
