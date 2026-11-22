import { router, useLocalSearchParams } from 'expo-router';
import { List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useListings } from '../../api/hooks';
import type { ListingFilters } from '../../api/types';
import { CategoryChips } from '../../components/CategoryChips';
import { EmptyState } from '../../components/EmptyState';
import { FilterSheet } from '../../components/FilterSheet';
import { Input } from '../../components/Input';
import { ListingCard } from '../../components/ListingCard';
import { ListingMap } from '../../components/ListingMap';
import { ProductArt } from '../../components/ProductArt';
import { Skeleton } from '../../components/Skeleton';
import { Text } from '../../components/Text';
import { barangayCoords } from '../../lib/barangays';
import { countActiveFilters, filtersToParams } from '../../lib/filters';
import { formatPeso } from '../../lib/format';
import { useDebounced } from '../../lib/useDebounced';
import { useAuth, useCurrentUser } from '../../store/auth';
import { radii } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

const GAP = 12;
const PAD = 20;

export default function Explore() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const user = useCurrentUser();
  const me = user.barangay ? barangayCoords(user.barangay) : null;

  const [filters, setFilters] = useState<ListingFilters>({ sort: 'newest', ...filtersToParams(params) });
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sheet, setSheet] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounced = useDebounced(query, 300);

  // Navigating here from Home (category chip, "See all", pre-orders) applies those params.
  const sig = `${params.category ?? ''}|${params.sort ?? ''}|${params.preorder ?? ''}|${params.q ?? ''}`;
  useEffect(() => {
    const p = filtersToParams(params);
    if (Object.keys(p).length) setFilters((f) => ({ ...f, ...p }));
    if (typeof params.q === 'string') setQuery(params.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const effective: ListingFilters = { ...filters, q: debounced.trim() || undefined, ...(filters.sort === 'nearest' && me ? { lat: me.lat, lng: me.lng } : {}) };
  const { data, isLoading, isFetching, refetch } = useListings(effective);
  const items = data ?? [];
  const active = countActiveFilters(filters);
  const cardWidth = (width - PAD * 2 - GAP) / 2;

  const markers = useMemo(() => items.map((l) => ({ id: l.id, lat: l.coords.lat, lng: l.coords.lng, label: l.title, price: `${formatPeso(l.price)}/${t(`units.${l.unit}`)}` })), [items, t]);
  const selected = items.find((l) => l.id === selectedId) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <View style={{ paddingHorizontal: PAD, gap: 12 }}>
        <Input
          testID="explore-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('explore.searchPlaceholder')}
          returnKeyType="search"
          autoCorrect={false}
          left={<Search size={18} color={colors.muted} />}
          right={query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <X size={18} color={colors.muted} />
            </Pressable>
          ) : undefined}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            testID="open-filters"
            onPress={() => setSheet(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14, borderRadius: radii.chip, borderWidth: 1, borderColor: active ? colors.eyebrow : colors.border, backgroundColor: colors.surface }}
          >
            <SlidersHorizontal size={16} color={active ? colors.eyebrow : colors.text} />
            <Text variant="label">{t('explore.filters')}</Text>
            {active ? (
              <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.eyebrow, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, color: '#1F1E1B', fontWeight: '700' }}>{active}</Text>
              </View>
            ) : null}
          </Pressable>
          <Text variant="caption" style={{ flex: 1 }}>
            {isFetching && !isLoading ? t('common.loading') : t('explore.results', { count: items.length })}
          </Text>
          <View style={{ flexDirection: 'row', borderRadius: radii.chip, borderWidth: 1, borderColor: colors.border, padding: 3, backgroundColor: colors.surface }}>
            {(['list', 'map'] as const).map((v) => (
              <Pressable
                key={v}
                testID={`view-${v}`}
                onPress={() => {
                  setView(v);
                  setSelectedId(null);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 32, borderRadius: radii.chip, backgroundColor: view === v ? colors.primary : 'transparent' }}
              >
                {v === 'list' ? <List size={15} color={view === v ? colors.primaryText : colors.muted} /> : <MapIcon size={15} color={view === v ? colors.primaryText : colors.muted} />}
                <Text variant="label" style={{ color: view === v ? colors.primaryText : colors.muted }}>
                  {t(`explore.${v}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <View style={{ marginVertical: 12 }}>
        <CategoryChips value={filters.category} onChange={(c) => setFilters((f) => ({ ...f, category: c }))} />
      </View>

      {view === 'list' ? (
        isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: PAD }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ width: cardWidth, gap: 8 }}>
                <Skeleton height={124} radius={20} />
                <Skeleton width="70%" />
                <Skeleton width="45%" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            testID="explore-list"
            data={items}
            keyExtractor={(l) => l.id}
            numColumns={2}
            columnWrapperStyle={{ gap: GAP }}
            contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: 32, gap: GAP }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshing={isFetching && !isLoading}
            onRefresh={() => void refetch()}
            renderItem={({ item }) => <ListingCard listing={item} width={cardWidth} />}
            ListEmptyComponent={<EmptyState emoji="🔍" title={t('explore.noResults')} hint={t('explore.noResultsHint')} />}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <ListingMap markers={markers} onSelect={setSelectedId} />
          {selected ? (
            <Pressable
              testID="map-preview"
              onPress={() => router.push(`/listing/${selected.id}`)}
              style={{ position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radii.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, elevation: 8 }}
            >
              <ProductArt title={selected.title} category={selected.category} photo={selected.photos[0]} height={72} width={72} radius={16} />
              <View style={{ flex: 1 }}>
                <Text variant="subtitle" numberOfLines={1}>
                  {selected.title}
                </Text>
                <Text variant="caption" numberOfLines={1}>
                  {selected.seller.name} • {selected.barangay}
                </Text>
                <Text variant="price" style={{ fontSize: 18, lineHeight: 24 }}>
                  {formatPeso(selected.price)}
                  <Text variant="caption">/{t(`units.${selected.unit}`)}</Text>
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      )}

      <FilterSheet
        visible={sheet}
        value={filters}
        onClose={() => setSheet(false)}
        onApply={(f) => {
          setFilters({ ...f, category: filters.category });
          setSheet(false);
        }}
      />
    </View>
  );
}
