import { Image } from 'expo-image';
import { Check, CheckCheck, Clock } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { assetUrl } from '../api/server';
import type { MessageDTO } from '../api/types';
import { formatChatTime } from '../lib/format';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  message: MessageDTO;
  mine: boolean;
  onPressImage?: (url: string) => void;
  onRetry?: () => void;
}

export function MessageBubble({ message: m, mine, onPressImage, onRetry }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const bg = mine ? colors.primary : colors.surface;
  const fg = mine ? colors.primaryText : colors.text;
  const meta = mine ? colors.primaryText : colors.muted;
  const tick = m.pending ? <Clock size={12} color={meta} /> : m.readAt ? <CheckCheck size={14} color={colors.eyebrow} /> : <Check size={14} color={meta} />;

  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
      <Pressable
        disabled={!m.failed}
        onPress={onRetry}
        style={{
          backgroundColor: bg,
          borderRadius: radii.card,
          borderBottomRightRadius: mine ? 6 : radii.card,
          borderBottomLeftRadius: mine ? radii.card : 6,
          borderWidth: mine ? 0 : 1,
          borderColor: colors.border,
          paddingHorizontal: m.type === 'image' ? 4 : 14,
          paddingTop: m.type === 'image' ? 4 : 10,
          paddingBottom: 8,
          opacity: m.pending ? 0.75 : 1,
          gap: 4,
        }}
      >
        {m.type === 'image' && m.imageUrl ? (
          <Pressable onPress={() => onPressImage?.(m.imageUrl!)}>
            <Image source={{ uri: assetUrl(m.imageUrl) ?? undefined }} style={{ width: 220, height: 220, borderRadius: radii.card - 6 }} contentFit="cover" transition={150} />
          </Pressable>
        ) : (
          <Text style={{ color: fg }}>{m.text}</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingHorizontal: m.type === 'image' ? 8 : 0 }}>
          <Text variant="caption" style={{ color: meta, opacity: 0.8, fontSize: 10.5 }}>
            {formatChatTime(m.createdAt)}
          </Text>
          {mine ? tick : null}
        </View>
      </Pressable>
      {m.failed ? (
        <Text variant="caption" color="danger" style={{ alignSelf: 'flex-end', marginTop: 2 }}>
          {t('chat.failed')}
        </Text>
      ) : null}
    </View>
  );
}
