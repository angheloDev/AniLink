import { Star } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Stars({ rating, size = 16, onChange }: { rating: number; size?: number; onChange?: (n: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n - 0.25;
        const star = <Star size={size} color={filled ? colors.sun : colors.border} fill={filled ? colors.sun : 'transparent'} />;
        return onChange ? (
          <Pressable key={n} testID={`star-${n}`} onPress={() => onChange(n)} hitSlop={6}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}
