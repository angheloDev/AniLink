import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';

interface Props {
  title: string;
  hint?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, hint, emoji = '🌱', actionLabel, onAction }: Props) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 }}>
      <Text style={{ fontSize: 44, lineHeight: 56 }}>{emoji}</Text>
      <Text variant="subtitle" center>
        {title}
      </Text>
      {hint ? (
        <Text variant="body" color="muted" center>
          {hint}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} size="sm" style={{ marginTop: 12 }} /> : null}
    </View>
  );
}
