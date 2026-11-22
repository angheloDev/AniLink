import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { Text } from '../components/Text';
import { useTheme } from '../theme/useTheme';

export default function Help() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [1, 2, 3, 4].map((n) => ({ q: t(`settings.faq${n}q`), a: t(`settings.faq${n}a`) }));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('settings.help')} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {faqs.map((f, i) => (
          <Pressable key={i} testID={`faq-${i}`} onPress={() => setOpen(open === i ? null : i)}>
            <Card style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text variant="subtitle" style={{ flex: 1, fontSize: 15.5 }}>
                  {f.q}
                </Text>
                <View style={{ transform: [{ rotate: open === i ? '180deg' : '0deg' }] }}>
                  <ChevronDown size={20} color={colors.muted} />
                </View>
              </View>
              {open === i ? <Text color="muted">{f.a}</Text> : null}
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
