import React, { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
}

/** One box per digit, driven by a single hidden text input so the system number pad and paste both work. */
export function OtpInput({ value, onChange, onComplete, length = 6, autoFocus = true }: Props) {
  const { colors } = useTheme();
  const ref = useRef<React.ComponentRef<typeof TextInput>>(null);
  const handle = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityRole="none">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        {Array.from({ length }, (_, i) => {
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              testID="otp-box"
              style={{
                flex: 1,
                height: 56,
                borderRadius: radii.input,
                borderWidth: 1.5,
                borderColor: active ? colors.eyebrow : colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.semibold, fontSize: 22 }}>{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        testID="otp-input"
        value={value}
        onChangeText={handle}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        maxLength={length * 2}
        caretHidden
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
    </Pressable>
  );
}
