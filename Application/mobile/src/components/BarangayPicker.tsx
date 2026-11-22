import { ChevronDown, MapPin, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { filterBarangays } from '../lib/barangays';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Input } from './Input';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface Props {
  label?: string;
  value: string | null | undefined;
  onChange: (name: string) => void;
  /** Allow choosing "any barangay" (for filters). */
  allowAny?: boolean;
  error?: string | null;
}

export function BarangayPicker({ label, value, onChange, allowAny, error }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const items = filterBarangays(query);
  return (
    <View>
      {label ? (
        <Text variant="label" color="muted" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <Pressable
        testID="barangay-picker"
        onPress={() => setOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: radii.input, borderWidth: 1.5, borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 }}
      >
        <MapPin size={18} color={colors.eyebrow} />
        <Text style={{ flex: 1 }} color={value ? 'text' : 'muted'}>
          {value || (allowAny ? t('explore.anyBarangay') : t('onboarding.searchBarangay'))}
        </Text>
        <ChevronDown size={18} color={colors.muted} />
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('onboarding.barangay')}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('onboarding.searchBarangay')}
          left={<Search size={18} color={colors.muted} />}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <FlatList
          style={{ marginTop: 8, maxHeight: 360 }}
          keyboardShouldPersistTaps="handled"
          data={allowAny ? [{ name: '', lat: 0, lng: 0 }, ...items] : items}
          keyExtractor={(b) => b.name || 'any'}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.name);
                setOpen(false);
                setQuery('');
              }}
              style={({ pressed }) => ({ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 })}
            >
              <Text color={item.name === (value ?? '') ? 'eyebrow' : 'text'}>{item.name || t('explore.anyBarangay')}</Text>
            </Pressable>
          )}
        />
      </Sheet>
    </View>
  );
}
