import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createListing, patchMe } from '../../api/endpoints';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ListingForm } from '../../components/ListingForm';
import { useToast } from '../../components/Toast';
import { emptyListingForm } from '../../lib/validateListing';
import { useAuth, useCurrentUser } from '../../store/auth';
import { useTheme } from '../../theme/useTheme';

export default function Sell() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();
  const user = useCurrentUser();
  const [formKey, setFormKey] = useState(0);
  const [switching, setSwitching] = useState(false);

  if (user.role !== 'farmer') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, paddingTop: insets.top }}>
        <EmptyState emoji="🧑‍🌾" title={t('sell.switchPrompt')} />
        <Button
          testID="switch-to-farmer"
          label={t('sell.switchAction')}
          loading={switching}
          onPress={async () => {
            setSwitching(true);
            try {
              const { user: u } = await patchMe({ role: 'farmer' });
              useAuth.getState().setUser(u);
            } catch {
              toast.show(t('common.error'), 'error');
            } finally {
              setSwitching(false);
            }
          }}
        />
      </View>
    );
  }

  return (
    <ListingForm
      key={formKey}
      showBack={false}
      title={t('sell.newTitle')}
      initial={{ ...emptyListingForm(), barangay: user.barangay }}
      submitLabel={t('sell.publish')}
      onSubmit={async (input) => {
        const { listing } = await createListing(input);
        void qc.invalidateQueries({ queryKey: ['listings'] });
        void qc.invalidateQueries({ queryKey: ['dashboard'] });
        toast.show(t('sell.published'), 'success');
        setFormKey((k) => k + 1);
        router.push(`/listing/${listing.id}`);
      }}
    />
  );
}
