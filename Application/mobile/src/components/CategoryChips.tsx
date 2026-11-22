import React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, type Category } from '../api/types';
import { CATEGORY_EMOJI } from '../theme/tokens';
import { Chip } from './Chip';

interface Props {
  value: Category | '' | undefined;
  onChange: (c: Category | '') => void;
  paddingHorizontal?: number;
}

export function CategoryChips({ value, onChange, paddingHorizontal = 20 }: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal }} keyboardShouldPersistTaps="handled">
      <Chip label={t('categories.all')} selected={!value} onPress={() => onChange('')} testID="chip-all" />
      {CATEGORIES.map((c) => (
        <Chip key={c} testID={`chip-${c}`} label={t(`categories.${c}`)} emoji={CATEGORY_EMOJI[c]} selected={value === c} onPress={() => onChange(c)} />
      ))}
    </ScrollView>
  );
}
