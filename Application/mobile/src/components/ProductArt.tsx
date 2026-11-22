import { Image } from 'expo-image';
import React from 'react';
import { View, type DimensionValue } from 'react-native';
import { assetUrl } from '../api/server';
import { emojiFor } from '../lib/emoji';
import { tintFor } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  title: string;
  category: string;
  photo?: string | null;
  height?: number;
  width?: DimensionValue;
  emojiSize?: number;
  radius?: number;
}

/** A real photo when there is one, otherwise the tinted emoji art used in the Fieldlink-style cards. */
export function ProductArt({ title, category, photo, height = 120, width = '100%', emojiSize, radius = 0 }: Props) {
  const { colors } = useTheme();
  const src = assetUrl(photo);
  if (src) {
    return <Image source={{ uri: src }} style={{ width, height, borderRadius: radius }} contentFit="cover" transition={150} />;
  }
  return (
    <View style={{ width, height, borderRadius: radius, backgroundColor: tintFor(colors, category), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', width: height * 0.9, height: height * 0.9, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <Text style={{ fontSize: emojiSize ?? height * 0.46, lineHeight: (emojiSize ?? height * 0.46) * 1.25 }}>{emojiFor(title, category)}</Text>
    </View>
  );
}
