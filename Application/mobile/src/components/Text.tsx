import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { fonts, type Colors } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'eyebrow' | 'label' | 'price';

interface Props extends TextProps {
  variant?: TextVariant;
  /** A theme color key (e.g. "muted") or a raw color string. */
  color?: keyof Colors | (string & {});
  center?: boolean;
}

const base: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 42 },
  title: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  caption: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11.5, lineHeight: 16, letterSpacing: 2.2 },
  label: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20 },
  price: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30 },
};

const defaultColor: Record<TextVariant, keyof Colors> = {
  display: 'headline',
  title: 'text',
  subtitle: 'text',
  body: 'text',
  caption: 'muted',
  eyebrow: 'eyebrow',
  label: 'text',
  price: 'headline',
};

export function Text({ variant = 'body', color, center, style, children, ...rest }: Props) {
  const { colors } = useTheme();
  const key = color ?? defaultColor[variant];
  const resolved = (colors as Record<string, string>)[key as string] ?? (key as string);
  const content = variant === 'eyebrow' && typeof children === 'string' ? children.toUpperCase() : children;
  return (
    <RNText {...rest} style={[base[variant], { color: resolved }, center && { textAlign: 'center' }, style]}>
      {content}
    </RNText>
  );
}
