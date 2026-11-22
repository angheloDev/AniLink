import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';

interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
  testID?: string;
}

export function StatTile({ label, value, icon, highlight, testID }: Props) {
  return (
    <Card testID={testID} style={{ flex: 1, minWidth: 140, gap: 6, backgroundColor: highlight ? undefined : undefined }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="caption">{label}</Text>
        {icon}
      </View>
      <Text variant="title" color={highlight ? 'accent' : 'headline'} style={{ fontSize: 26, lineHeight: 34 }}>
        {value}
      </Text>
    </Card>
  );
}
