import { Delete } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { tap } from '../lib/haptics';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/** Four-dot PIN display with an on-screen number pad, like a wallet app. */
export function MpinKeypad({ value, onChange, length = 4 }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 20, alignItems: 'center' }}>
      <View testID="mpin-dots" style={{ flexDirection: 'row', gap: 16 }}>
        {Array.from({ length }, (_, i) => (
          <View key={i} style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.eyebrow, backgroundColor: i < value.length ? colors.eyebrow : 'transparent' }} />
        ))}
      </View>
      <View style={{ width: 270, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
        {KEYS.map((k, i) =>
          k === '' ? (
            <View key={i} style={{ width: 82, height: 58 }} />
          ) : (
            <Pressable
              key={i}
              testID={k === 'del' ? 'mpin-del' : `mpin-${k}`}
              onPress={() => {
                tap();
                if (k === 'del') onChange(value.slice(0, -1));
                else if (value.length < length) onChange(value + k);
              }}
              style={({ pressed }) => ({ width: 82, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.border : colors.surface, borderWidth: 1, borderColor: colors.border })}
            >
              {k === 'del' ? <Delete size={22} color={colors.text} /> : <Text style={{ fontFamily: fonts.semibold, fontSize: 22 }}>{k}</Text>}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}
