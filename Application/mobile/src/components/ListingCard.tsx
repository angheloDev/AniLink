import { router } from 'expo-router';
import { Heart, Hourglass } from 'lucide-react-native';
import React from 'react';
import { Pressable, View, type DimensionValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ListingDTO } from '../api/types';
import { useToggleFavorite } from '../api/hooks';
import { formatPeso } from '../lib/format';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { VerifiedMark } from './Badge';
import { ProductArt } from './ProductArt';
import { Text } from './Text';

interface Props {
  listing: ListingDTO;
  width?: DimensionValue;
  onPress?: () => void;
}

export function ListingCard({ listing, width = 200, onPress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toggle = useToggleFavorite();
  const l = listing;
  const unavailable = l.status !== 'active';
  const guide = l.priceGuide;

  return (
    <Pressable
      testID={`listing-card-${l.id}`}
      onPress={onPress ?? (() => router.push(`/listing/${l.id}`))}
      style={({ pressed }) => ({ width, backgroundColor: colors.card, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', opacity: pressed ? 0.9 : 1 })}
    >
      <View>
        <ProductArt title={l.title} category={l.category} photo={l.photos[0]} height={124} />
        <Pressable
          testID={`favorite-${l.id}`}
          hitSlop={8}
          onPress={() => void toggle(l)}
          style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Heart size={18} color={l.favorited ? colors.accent : '#fff'} fill={l.favorited ? colors.accent : 'transparent'} />
        </Pressable>
        <View style={{ position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', gap: 6 }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontFamily: fonts.medium, fontSize: 11 }}>{t(`categories.${l.category}`)}</Text>
          </View>
          {l.preorder ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sun, paddingHorizontal: 8, height: 24, borderRadius: 12 }}>
              <Hourglass size={12} color="#1F1E1B" />
              <Text style={{ color: '#1F1E1B', fontFamily: fonts.semibold, fontSize: 11 }}>{t('common.preorder')}</Text>
            </View>
          ) : null}
        </View>
        {unavailable ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontFamily: fonts.semibold }}>{l.status === 'soldout' ? t('common.soldOut') : t('common.paused')}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: 14, gap: 3 }}>
        <Text variant="subtitle" numberOfLines={1} style={{ fontSize: 15.5 }}>
          {l.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="caption" numberOfLines={1} style={{ flexShrink: 1 }}>
            {l.seller.name} • {l.barangay}
          </Text>
          {l.seller.verified ? <VerifiedMark size={13} /> : null}
        </View>
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text>
            <Text variant="price" style={{ fontSize: 21 }}>
              {formatPeso(l.price)}
            </Text>
            <Text variant="caption">/{t(`units.${l.unit}`)}</Text>
          </Text>
          <Text variant="caption" style={{ fontSize: 11 }}>
            {l.distanceKm != null ? t('explore.kmAway', { km: l.distanceKm }) : t('common.available', { qty: l.stock, unit: t(`units.${l.unit}`) })}
          </Text>
        </View>
        {guide && guide.label !== 'fair' ? (
          <Text variant="caption" style={{ fontSize: 11, color: guide.label === 'below' ? colors.success : colors.accent, marginTop: 2 }}>
            {guide.label === 'below' ? '↓ ' : '↑ '}
            {t(guide.label === 'below' ? 'listing.below' : 'listing.above', { n: Math.abs(Math.round(guide.diff)) })}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
