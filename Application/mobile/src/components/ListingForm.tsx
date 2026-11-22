import { Image } from 'expo-image';
import { ImagePlus, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiError, NetworkError, uploadImages } from '../api/client';
import { assetUrl } from '../api/server';
import { CATEGORIES, UNITS, type ListingInput } from '../api/types';
import { pickImages } from '../lib/pickImage';
import { toListingInput, validateListing, type ListingErrors, type ListingFormValues } from '../lib/validateListing';
import { CATEGORY_EMOJI, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { BarangayPicker } from './BarangayPicker';
import { Button } from './Button';
import { Chip } from './Chip';
import { DateField } from './DateField';
import { Input, type InputRef } from './Input';
import { KeyboardScreen } from './KeyboardScreen';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';
import { useToast } from './Toast';

interface Props {
  title: string;
  initial: ListingFormValues;
  submitLabel: string;
  onSubmit: (input: ListingInput) => Promise<void>;
  showBack?: boolean;
}

const isLocal = (u: string) => u.startsWith('file:') || u.startsWith('content:');

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={value ? colors.eyebrow : colors.muted} />
    </View>
  );
}

export function ListingForm({ title, initial, submitLabel, onSubmit, showBack = true }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const [v, setV] = useState<ListingFormValues>(initial);
  const [errors, setErrors] = useState<ListingErrors>({});
  const [loading, setLoading] = useState(false);
  const descRef = useRef<InputRef>(null);
  const stockRef = useRef<InputRef>(null);
  const minRef = useRef<InputRef>(null);
  const set = (patch: Partial<ListingFormValues>) => setV((cur) => ({ ...cur, ...patch }));
  const err = (k: keyof ListingErrors) => (errors[k] ? t(errors[k]!) : null);

  async function addPhotos() {
    const room = 5 - v.photos.length;
    if (room <= 0) return;
    const uris = await pickImages({ multiple: true, max: room });
    if (uris.length) set({ photos: [...v.photos, ...uris].slice(0, 5) });
  }

  async function submit() {
    const errs = validateListing(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const local = v.photos.filter(isLocal);
      const uploaded = local.length ? await uploadImages(local) : [];
      let i = 0;
      const photos = v.photos.map((p) => (isLocal(p) ? uploaded[i++] : p));
      await onSubmit(toListingInput({ ...v, photos }));
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : e instanceof NetworkError ? t('auth.errNetwork') : t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardScreen
      header={<ScreenHeader title={title} noBack={!showBack} />}
      footer={
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Button testID="submit-listing" label={submitLabel} loading={loading} onPress={submit} />
        </View>
      }
    >
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="label" color="muted">
            {t('sell.photos')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {v.photos.map((p, i) => (
              <View key={`${p}-${i}`} style={{ width: 92, height: 92, borderRadius: 18, overflow: 'hidden' }}>
                <Image source={{ uri: assetUrl(p) ?? undefined }} style={{ width: 92, height: 92 }} contentFit="cover" />
                <Pressable
                  onPress={() => set({ photos: v.photos.filter((_, j) => j !== i) })}
                  hitSlop={6}
                  style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {v.photos.length < 5 ? (
              <Pressable
                testID="add-photos"
                onPress={addPhotos}
                style={{ width: 92, height: 92, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surface }}
              >
                <ImagePlus size={24} color={colors.eyebrow} />
                <Text variant="caption" style={{ fontSize: 10.5 }} center>
                  {v.photos.length}/5
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
          <Text variant="caption">{t('sell.addPhotos')}</Text>
        </View>

        <Input label={t('sell.title')} value={v.title} onChangeText={(x) => set({ title: x })} autoCapitalize="words" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => descRef.current?.focus()} error={err('title')} />
        <Input ref={descRef} label={t('sell.description')} value={v.description} onChangeText={(x) => set({ description: x })} multiline numberOfLines={3} />

        <View style={{ gap: 8 }}>
          <Text variant="label" color="muted">
            {t('sell.category')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} testID={`cat-${c}`} label={t(`categories.${c}`)} emoji={CATEGORY_EMOJI[c]} selected={v.category === c} onPress={() => set({ category: c })} />
            ))}
          </View>
          {err('category') ? (
            <Text variant="caption" color="danger">
              {err('category')}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input containerStyle={{ flex: 1 }} label={`${t('sell.price')} (₱)`} value={v.price} onChangeText={(x) => set({ price: x })} keyboardType="decimal-pad" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => stockRef.current?.focus()} error={err('price')} />
            <Input ref={stockRef} containerStyle={{ flex: 1 }} label={t('sell.stock')} value={v.stock} onChangeText={(x) => set({ stock: x })} keyboardType="decimal-pad" returnKeyType="next" blurOnSubmit={false} onSubmitEditing={() => minRef.current?.focus()} error={err('stock')} />
          </View>
          <Text variant="label" color="muted">
            {t('sell.unit')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {UNITS.map((u) => (
              <Chip key={u} testID={`unit-${u}`} label={t(`units.${u}`)} selected={v.unit === u} onPress={() => set({ unit: u })} />
            ))}
          </View>
        </View>

        <Input ref={minRef} label={t('sell.minOrder')} value={v.minOrder} onChangeText={(x) => set({ minOrder: x })} keyboardType="decimal-pad" returnKeyType="done" error={err('minOrder')} />

        <View style={{ borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8 }}>
          <SwitchRow label={t('sell.preorderToggle')} value={v.preorder} onChange={(x) => set({ preorder: x })} />
          <SwitchRow label={t('sell.negotiableToggle')} value={v.negotiable} onChange={(x) => set({ negotiable: x })} />
          <SwitchRow label={t('sell.pickupToggle')} value={v.pickup} onChange={(x) => set({ pickup: x })} />
          <SwitchRow label={t('sell.deliveryToggle')} value={v.delivery} onChange={(x) => set({ delivery: x })} />
        </View>
        {err('fulfil') ? (
          <Text variant="caption" color="danger">
            {err('fulfil')}
          </Text>
        ) : null}

        <DateField label={t('sell.harvestDate')} value={v.harvestDate} onChange={(x) => set({ harvestDate: x })} error={err('harvestDate')} offsets={v.preorder ? [3, 7, 14, 21, 30] : [0, 1, 2, 3, 7]} />
        <BarangayPicker label={t('onboarding.barangay')} value={v.barangay} onChange={(b) => set({ barangay: b })} error={err('barangay')} />
      </View>
    </KeyboardScreen>
  );
}
