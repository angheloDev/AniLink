import { Check, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { tap } from '../lib/haptics';
import { MAX_ITEMS, addItems, parseItems, toggleItem } from '../lib/items';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Button } from './Button';
import { Input } from './Input';
import { Text } from './Text';

interface Props {
  label: string;
  /** Ready-made choices; anything else the person adds appears as its own chip. */
  suggestions: string[];
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Pick any number of items: tap suggestions, or type your own (several at once, separated by commas)
 * and press Add. Selected chips show a check; your own items show an x so they can be removed.
 */
export function ItemPicker({ label, suggestions, value, onChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const chips = [...suggestions, ...value.filter((v) => !suggestions.includes(v))];
  const full = value.length >= MAX_ITEMS;
  const canAdd = !full && parseItems(text).length > 0;

  const add = () => {
    if (!canAdd) return;
    onChange(addItems(value, text, suggestions));
    setText('');
  };

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text variant="label" color="muted" style={{ flexShrink: 1 }}>
          {label}
        </Text>
        {value.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text testID="item-count" variant="caption" color="eyebrow">
              {t('onboarding.cropsSelected', { count: value.length })}
            </Text>
            <Pressable testID="item-clear" accessibilityRole="button" hitSlop={10} onPress={() => onChange([])}>
              <Text variant="caption" color="muted" style={{ textDecorationLine: 'underline' }}>
                {t('onboarding.cropsClear')}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <Text variant="caption" color="muted">
        {t('onboarding.cropsHint')}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {chips.map((c) => {
          const selected = value.includes(c);
          const custom = !suggestions.includes(c);
          return (
            <Pressable
              key={c}
              testID={`item-chip-${c}`}
              accessibilityRole="button"
              accessibilityLabel={selected && custom ? t('onboarding.cropsRemove', { name: c }) : c}
              accessibilityState={{ selected }}
              onPress={() => {
                tap();
                onChange(toggleItem(value, c));
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 14,
                paddingRight: selected ? 10 : 14,
                height: 40,
                borderRadius: radii.chip,
                borderWidth: 1.5,
                borderColor: selected ? colors.eyebrow : colors.border,
                backgroundColor: selected ? colors.primary : 'transparent',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: fonts.medium, fontSize: 13.5, color: selected ? colors.primaryText : colors.text }}>{c}</Text>
              {selected ? custom ? <X size={15} color={colors.primaryText} /> : <Check size={15} color={colors.eyebrow} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Input
          testID="item-input"
          containerStyle={{ flex: 1 }}
          value={text}
          onChangeText={setText}
          placeholder={t('onboarding.cropsPlaceholder')}
          autoCapitalize="words"
          returnKeyType="done"
          blurOnSubmit={false}
          editable={!full}
          onSubmitEditing={add}
        />
        <Button testID="item-add" label={t('onboarding.cropsAdd')} icon={<Plus size={16} color={colors.primaryText} />} disabled={!canAdd} onPress={add} style={{ height: 52 }} />
      </View>
      {full ? (
        <Text variant="caption" color="muted">
          {t('onboarding.cropsLimit', { count: MAX_ITEMS })}
        </Text>
      ) : null}
    </View>
  );
}
