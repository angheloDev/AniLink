import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/useTheme';
import { EmptyState } from './EmptyState';
import { ScreenHeader } from './ScreenHeader';

/** Shown instead of an endless loader when a screen's data could not be fetched. */
export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View testID="error-screen" style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader />
      <EmptyState emoji="📡" title={t('common.error')} hint={t('common.offlineHint')} actionLabel={t('common.retry')} onAction={onRetry} />
    </View>
  );
}
