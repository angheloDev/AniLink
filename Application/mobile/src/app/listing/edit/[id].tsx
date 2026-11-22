import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { updateListing } from '../../../api/endpoints';
import { useListing } from '../../../api/hooks';
import { ListingForm } from '../../../components/ListingForm';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { ScreenLoader } from '../../../components/LogoLoader';
import { useToast } from '../../../components/Toast';
import { type ListingFormValues } from '../../../lib/validateListing';
import { useTheme } from '../../../theme/useTheme';

export default function EditListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: l, isLoading } = useListing(id);

  if (isLoading || !l) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title={t('sell.editTitle')} />
        <ScreenLoader />
      </View>
    );
  }

  const initial: ListingFormValues = {
    title: l.title,
    description: l.description,
    category: l.category,
    price: String(l.price),
    unit: l.unit,
    stock: String(l.stock),
    minOrder: String(l.minOrder),
    harvestDate: l.harvestDate ? l.harvestDate.slice(0, 10) : '',
    preorder: l.preorder,
    negotiable: l.negotiable,
    pickup: l.pickup,
    delivery: l.delivery,
    barangay: l.barangay,
    photos: l.photos,
  };

  return (
    <ListingForm
      title={t('sell.editTitle')}
      initial={initial}
      submitLabel={t('sell.saveChanges')}
      onSubmit={async (input) => {
        await updateListing(l.id, input);
        void qc.invalidateQueries({ queryKey: ['listing', l.id] });
        void qc.invalidateQueries({ queryKey: ['listings'] });
        toast.show(t('sell.saved'), 'success');
        router.back();
      }}
    />
  );
}
