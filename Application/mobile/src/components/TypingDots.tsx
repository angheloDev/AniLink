import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export function TypingDots() {
  const { colors } = useTheme();
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);
  return (
    <View testID="typing-dots" style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: 5, backgroundColor: colors.surface, borderRadius: radii.card, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: colors.border }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted, opacity: d }} />
      ))}
    </View>
  );
}
