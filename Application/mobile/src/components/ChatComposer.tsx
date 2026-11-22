import { ImagePlus, Send, Tag } from 'lucide-react-native';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { tap } from '../lib/haptics';
import { fonts, radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onOffer?: () => void;
}

/** Message input that rides above the keyboard. Grows to 5 lines, then scrolls. */
export function ChatComposer({ value, onChange, onSend, onAttach, onOffer }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const can = value.trim().length > 0;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: keyboardVisible ? 8 : insets.bottom + 8,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Pressable testID="attach" onPress={onAttach} hitSlop={6} style={{ width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={t('chat.attach')}>
        <ImagePlus size={22} color={colors.muted} />
      </Pressable>
      {onOffer ? (
        <Pressable testID="offer-button" onPress={onOffer} hitSlop={6} style={{ width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={t('chat.sendOffer')}>
          <Tag size={22} color={colors.accent} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1, minHeight: 44, maxHeight: 128, borderRadius: radii.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, paddingHorizontal: 14, justifyContent: 'center' }}>
        <TextInput
          testID="chat-input"
          value={value}
          onChangeText={onChange}
          placeholder={t('chat.typeMessage')}
          placeholderTextColor={colors.muted}
          selectionColor={colors.eyebrow}
          multiline
          style={{ color: colors.text, fontFamily: fonts.regular, fontSize: 15.5, maxHeight: 118, paddingTop: 10, paddingBottom: 10, textAlignVertical: 'center' }}
        />
      </View>
      <Pressable
        testID="send"
        disabled={!can}
        onPress={() => {
          tap();
          onSend();
        }}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: can ? colors.accent : colors.border, alignItems: 'center', justifyContent: 'center' }}
        accessibilityLabel={t('common.send')}
      >
        <Send size={19} color={can ? '#1F1E1B' : colors.muted} />
      </Pressable>
    </View>
  );
}
