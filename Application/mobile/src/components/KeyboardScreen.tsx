import React from 'react';
import { Keyboard, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

interface Props {
  children: React.ReactNode;
  /** Scrollable form content that keeps the focused input visible above the keyboard (default). */
  scroll?: boolean;
  /** Content pinned above the keyboard (e.g. a chat composer or a primary button). */
  footer?: React.ReactNode;
  /** Fixed content above the scrolling area (e.g. a ScreenHeader, which handles the top inset itself). */
  header?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra space kept between the focused input and the keyboard. */
  bottomOffset?: number;
  edges?: { top?: boolean; bottom?: boolean };
}

/**
 * Screen wrapper where the text input is always the priority: the focused field scrolls into view,
 * the footer rides the keyboard, a drag or a tap on empty space dismisses it.
 */
export function KeyboardScreen({ children, scroll = true, footer, header, contentStyle, bottomOffset = 32, edges = { top: true, bottom: true } }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const top = header || edges.top === false ? 0 : insets.top;
  const bottom = edges.bottom === false ? 0 : insets.bottom;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: top }}>
      {header}
      {scroll ? (
        <KeyboardAwareScrollView
          bottomOffset={bottomOffset}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ flexGrow: 1, padding: 20, paddingBottom: footer ? 20 : bottom + 20 }, contentStyle]}
        >
          <Pressable accessible={false} onPress={Keyboard.dismiss} style={{ flexGrow: 1 }}>
            {children}
          </Pressable>
        </KeyboardAwareScrollView>
      ) : (
        <Pressable accessible={false} onPress={Keyboard.dismiss} style={[{ flex: 1 }, contentStyle]}>
          {children}
        </Pressable>
      )}
      {footer ? (
        <KeyboardStickyView offset={{ closed: 0, opened: bottom }}>
          <View style={{ paddingBottom: bottom, backgroundColor: colors.bg }}>{footer}</View>
        </KeyboardStickyView>
      ) : null}
    </View>
  );
}
