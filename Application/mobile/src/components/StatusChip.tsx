import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '../api/types';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

export function statusColor(colors: ReturnType<typeof useTheme>['colors'], s: OrderStatus): string {
  switch (s) {
    case 'completed':
      return colors.success;
    case 'cancelled':
      return colors.danger;
    case 'pending_payment':
      return colors.sun;
    case 'out_for_delivery':
    case 'ready_for_pickup':
      return colors.accent;
    default:
      return colors.eyebrow;
  }
}

export function StatusChip({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View testID="status-chip" style={{ alignSelf: 'flex-start', backgroundColor: statusColor(colors, status), borderRadius: 999, paddingHorizontal: 12, height: 26, justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 11.5, color: '#1F1E1B' }}>{t(`order.status.${status}`)}</Text>
    </View>
  );
}
