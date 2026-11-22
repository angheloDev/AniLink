import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<React.ComponentRef<typeof TextInput>, Props>(function Input({ label, error, left, right, containerStyle, style, multiline, onFocus, onBlur, ...rest }, ref) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" color="muted" style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : focused ? colors.eyebrow : colors.border, minHeight: multiline ? 96 : 52 },
        ]}
      >
        {left}
        <TextInput
          ref={ref}
          testID={label ? `input-${label}` : rest.testID}
          placeholderTextColor={colors.muted}
          selectionColor={colors.eyebrow}
          multiline={multiline}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text, fontFamily: fonts.regular, textAlignVertical: multiline ? 'top' : 'center' }, style]}
        />
        {right}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={{ marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radii.input, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, fontSize: 15.5, paddingVertical: 10 },
});
export type InputRef = React.ComponentRef<typeof TextInput>;
