import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

const mark = require('../../assets/logos/mark.png');

/** The AniLink mark inside a rotating ring. Used for every blocking process. */
export function LogoLoader({ size = 64, label }: { size?: number; label?: string }) {
  const { colors } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const ring = size + 26;
  return (
    <View testID="logo-loader" accessibilityRole="progressbar" style={{ alignItems: 'center', gap: 14 }}>
      <View style={{ width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: 3,
            borderColor: colors.border,
            borderTopColor: colors.eyebrow,
            transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
          }}
        />
        <Image source={mark} style={{ width: size, height: size }} resizeMode="contain" />
      </View>
      {label ? <Text variant="caption">{label}</Text> : null}
    </View>
  );
}

export function ScreenLoader({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <LogoLoader label={label} />
    </View>
  );
}
