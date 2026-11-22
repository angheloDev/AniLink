import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const light = require('../../assets/logos/loading-light.png');
const dark = require('../../assets/logos/loading-dark.png');

interface Props {
  /** When true the splash fades out and calls onDone. */
  done: boolean;
  onDone: () => void;
}

/** Continues the native splash (same logo, same position) with a gentle scale/fade, then fades away. */
export function AnimatedSplash({ done, onDone }: Props) {
  const { colors, resolved } = useTheme();
  const scale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0.85)).current;
  const overlay = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [scale, logoOpacity]);

  useEffect(() => {
    if (!done) return;
    Animated.timing(overlay, { toValue: 0, duration: 380, useNativeDriver: true }).start(() => onDone());
  }, [done, overlay, onDone]);

  return (
    <Animated.View
      pointerEvents={done ? 'none' : 'auto'}
      testID="animated-splash"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', opacity: overlay, zIndex: 1000 }]}
    >
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale }] }}>
        <Image source={resolved === 'dark' ? dark : light} style={{ width: 180, height: 207 }} resizeMode="contain" />
      </Animated.View>
    </Animated.View>
  );
}
