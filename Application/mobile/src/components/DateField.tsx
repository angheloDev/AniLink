import { Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { addDays, isValidIsoDate, todayIso } from '../lib/dates';
import { formatDate } from '../lib/format';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Button } from './Button';
import { Chip } from './Chip';
import { Input } from './Input';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface Props {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string | null;
  /** Quick-pick offsets in days from today. */
  offsets?: number[];
}

/** Date picker without a native dependency: quick choices plus a typed YYYY-MM-DD field. */
export function DateField({ label, value, onChange, error, offsets = [0, 1, 3, 7, 14, 30] }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(value);
  const typedValid = isValidIsoDate(typed);

  const labelFor = (n: number) => (n === 0 ? t('sell.today') : n === 1 ? t('sell.tomorrow') : t('sell.inDays', { n }));

  return (
    <View>
      <Text variant="label" color="muted" style={{ marginBottom: 6 }}>
        {label}
      </Text>
      <Pressable
        testID="date-field"
        onPress={() => {
          setTyped(value);
          setOpen(true);
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: radii.input, borderWidth: 1.5, borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 }}
      >
        <Calendar size={18} color={colors.eyebrow} />
        <Text color={value ? 'text' : 'muted'}>{value ? formatDate(value) : t('sell.pickDate')}</Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {offsets.map((n) => {
              const iso = addDays(todayIso(), n);
              return (
                <Chip
                  key={n}
                  label={labelFor(n)}
                  selected={value === iso}
                  onPress={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                />
              );
            })}
          </View>
          <Input label={t('sell.dateManual')} value={typed} onChangeText={setTyped} placeholder="2026-12-01" keyboardType="numbers-and-punctuation" returnKeyType="done" error={typed && !typedValid ? t('sell.errHarvest') : null} />
          <Button
            label={t('common.done')}
            disabled={!typedValid}
            onPress={() => {
              onChange(typed);
              setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}
