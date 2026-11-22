import React, { useEffect, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ListingFilters } from '../api/types';
import { useTheme } from '../theme/useTheme';
import { BarangayPicker } from './BarangayPicker';
import { Button } from './Button';
import { Chip } from './Chip';
import { Input } from './Input';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface Props {
  visible: boolean;
  value: ListingFilters;
  onClose: () => void;
  onApply: (f: ListingFilters) => void;
}

const SORTS: { id: NonNullable<ListingFilters['sort']>; key: string }[] = [
  { id: 'newest', key: 'explore.sortNewest' },
  { id: 'price_asc', key: 'explore.sortPriceAsc' },
  { id: 'price_desc', key: 'explore.sortPriceDesc' },
  { id: 'nearest', key: 'explore.sortNearest' },
  { id: 'rating', key: 'explore.sortRating' },
];

const num = (s: string): number | undefined => {
  const n = Number(s.replace(/[^\d.]/g, ''));
  return s.trim() && Number.isFinite(n) ? n : undefined;
};

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={value ? colors.eyebrow : colors.muted} />
    </View>
  );
}

export function FilterSheet({ visible, value, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ListingFilters>(value);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setMin(value.minPrice != null ? String(value.minPrice) : '');
      setMax(value.maxPrice != null ? String(value.maxPrice) : '');
    }
  }, [visible, value]);

  const set = (patch: Partial<ListingFilters>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Sheet visible={visible} onClose={onClose} title={t('explore.filters')}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
        <View style={{ gap: 16, paddingBottom: 8 }}>
          <View style={{ gap: 8 }}>
            <Text variant="label" color="muted">
              {t('explore.sort')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SORTS.map((s) => (
                <Chip key={s.id} label={t(s.key)} selected={(draft.sort ?? 'newest') === s.id} onPress={() => set({ sort: s.id })} />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="label" color="muted">
              {t('explore.priceRange')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Input containerStyle={{ flex: 1 }} placeholder={`₱ ${t('explore.min')}`} value={min} onChangeText={(v) => { setMin(v); set({ minPrice: num(v) }); }} keyboardType="numeric" returnKeyType="next" />
              <Input containerStyle={{ flex: 1 }} placeholder={`₱ ${t('explore.max')}`} value={max} onChangeText={(v) => { setMax(v); set({ maxPrice: num(v) }); }} keyboardType="numeric" returnKeyType="done" />
            </View>
          </View>
          <BarangayPicker label={t('explore.barangay')} value={draft.barangay} onChange={(b) => set({ barangay: b || undefined })} allowAny />
          <View>
            <SwitchRow label={t('explore.verifiedOnly')} value={!!draft.verifiedOnly} onChange={(v) => set({ verifiedOnly: v || undefined })} />
            <SwitchRow label={t('explore.preorderOnly')} value={!!draft.preorder} onChange={(v) => set({ preorder: v || undefined })} />
            <SwitchRow label={t('explore.deliveryOnly')} value={!!draft.delivery} onChange={(v) => set({ delivery: v || undefined })} />
          </View>
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <Button
          variant="ghost"
          label={t('explore.reset')}
          style={{ flex: 1 }}
          onPress={() => {
            setMin('');
            setMax('');
            setDraft({ sort: 'newest', category: draft.category, q: draft.q });
          }}
        />
        <Button testID="apply-filters" label={t('explore.apply')} style={{ flex: 2 }} onPress={() => onApply(draft)} />
      </View>
    </Sheet>
  );
}
