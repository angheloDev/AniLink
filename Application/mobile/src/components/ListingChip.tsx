import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ConversationDTO } from '../api/types';
import { formatPeso } from '../lib/format';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ProductArt } from './ProductArt';
import { Text } from './Text';

/** The listing a conversation is about, pinned under the chat header. */
export function ListingChip({ listing }: { listing: NonNullable<ConversationDTO['listing']> }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable
      testID="listing-chip"
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 12, marginBottom: 8, padding: 8, borderRadius: radii.input, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
    >
      <ProductArt title={listing.title} category={listing.category} photo={listing.photo} height={44} width={44} radius={12} emojiSize={22} />
      <View style={{ flex: 1 }}>
        <Text variant="label" numberOfLines={1}>
          {listing.title}
        </Text>
        <Text variant="caption">
          {formatPeso(listing.price)}/{t(`units.${listing.unit}`)}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}
