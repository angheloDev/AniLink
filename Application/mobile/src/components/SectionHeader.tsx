import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';

interface Props {
  title: string;
  eyebrow?: string;
  onSeeAll?: () => void;
  paddingHorizontal?: number;
}

export function SectionHeader({ title, eyebrow, onSeeAll, paddingHorizontal = 20 }: Props) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal, marginBottom: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow ? <Text variant="eyebrow">{eyebrow}</Text> : null}
        <Text variant="title" color="headline">
          {title}
        </Text>
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text variant="label" color="eyebrow">
            {t('common.seeAll')} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
