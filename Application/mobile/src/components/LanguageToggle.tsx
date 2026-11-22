import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage, type Language } from '../i18n';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

/** Compact EN | TL switch. */
export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const options: { id: Language; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'tl', label: 'TL' },
  ];
  return (
    <View style={{ flexDirection: 'row', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 3 }}>
      {options.map((o) => {
        const active = i18n.language === o.id;
        return (
          <Pressable
            key={o.id}
            testID={`lang-${o.id}`}
            onPress={() => void setLanguage(o.id)}
            style={{ paddingHorizontal: 14, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : 'transparent' }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: active ? colors.primaryText : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
