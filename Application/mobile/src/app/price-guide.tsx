import { router } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePriceGuide } from '../api/hooks';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { ScreenHeader } from '../components/ScreenHeader';
import { Skeleton } from '../components/Skeleton';
import { Sparkline } from '../components/Sparkline';
import { Text } from '../components/Text';
import { emojiFor } from '../lib/emoji';
import { formatPeso } from '../lib/format';
import { trendDelta } from '../lib/sparkline';
import { useTheme } from '../theme/useTheme';

export default function PriceGuide() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data, isLoading } = usePriceGuide();
  const [query, setQuery] = useState('');
  const items = (data ?? []).filter((g) => g.crop.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('priceGuide.title')} subtitle={t('priceGuide.sub')} />
      <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 8 }}>
        <Badge label={t('common.sampleData')} tone="sun" />
        <Input value={query} onChangeText={setQuery} placeholder={t('priceGuide.search')} left={<Search size={18} color={colors.muted} />} returnKeyType="search" autoCorrect={false} />
      </View>
      {isLoading ? (
        <View style={{ padding: 20, gap: 12 }}>
          <Skeleton height={130} radius={24} />
          <Skeleton height={130} radius={24} />
        </View>
      ) : (
        <FlatList
          testID="price-guide-list"
          data={items}
          keyExtractor={(g) => g.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState emoji="🔍" title={t('explore.noResults')} />}
          renderItem={({ item: g }) => {
            const delta = trendDelta(g.trend);
            const pos = g.high > g.low ? Math.min(1, Math.max(0, (g.avg - g.low) / (g.high - g.low))) : 0.5;
            return (
              <Card testID={`guide-${g.crop}`} style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 34, lineHeight: 44 }}>{emojiFor(g.crop, g.category)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle">{g.crop}</Text>
                    <Text variant="caption">{t('priceGuide.perUnit', { unit: t(`units.${g.unit}`) })}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="price">{formatPeso(g.avg)}</Text>
                    <Text variant="caption" style={{ color: delta > 0 ? colors.accent : delta < 0 ? colors.success : colors.muted }}>
                      {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta)}% · 8w
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border }}>
                      <View style={{ position: 'absolute', left: `${pos * 100}%`, top: -3, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.sun, marginLeft: -6 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="caption">
                        {t('priceGuide.low')} {formatPeso(g.low)}
                      </Text>
                      <Text variant="caption">
                        {t('priceGuide.high')} {formatPeso(g.high)}
                      </Text>
                    </View>
                  </View>
                  <Sparkline values={g.trend} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button size="sm" variant="ghost" label={t('priceGuide.viewListings')} style={{ flex: 1 }} onPress={() => router.push({ pathname: '/(tabs)/explore', params: { q: g.crop } })} />
                  <Button size="sm" label={t('priceGuide.notifyMe')} icon={<Bell size={15} color={colors.primaryText} />} style={{ flex: 1 }} onPress={() => router.push({ pathname: '/alerts', params: { crop: g.crop } })} />
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}
