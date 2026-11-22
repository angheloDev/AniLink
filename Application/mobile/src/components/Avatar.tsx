import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { assetUrl } from '../api/server';
import { initials } from '../lib/format';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';
import { VerifiedMark } from './Badge';

interface Props {
  name: string;
  uri?: string | null;
  size?: number;
  verified?: boolean;
}

export function Avatar({ name, uri, size = 44, verified }: Props) {
  const { colors } = useTheme();
  const src = assetUrl(uri);
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {src ? (
          <Image source={{ uri: src }} style={{ width: size, height: size }} contentFit="cover" transition={150} />
        ) : (
          <Text style={{ fontFamily: fonts.semibold, fontSize: size * 0.36, color: colors.primaryText }}>{initials(name)}</Text>
        )}
      </View>
      {verified ? (
        <View style={{ position: 'absolute', right: -3, bottom: -3, backgroundColor: colors.bg, borderRadius: 10, padding: 1 }}>
          <VerifiedMark size={Math.max(14, size * 0.32)} />
        </View>
      ) : null}
    </View>
  );
}
