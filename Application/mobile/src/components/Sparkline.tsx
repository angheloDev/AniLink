import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { sparklinePoints } from '../lib/sparkline';
import { useTheme } from '../theme/useTheme';

export function Sparkline({ values, width = 96, height = 36, color }: { values: number[]; width?: number; height?: number; color?: string }) {
  const { colors } = useTheme();
  const stroke = color ?? colors.eyebrow;
  const pts = sparklinePoints(values, width, height, 4);
  if (!pts.length) return null;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <Svg testID="sparkline" width={width} height={height}>
      <Path d={d} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={3.5} fill={stroke} />
    </Svg>
  );
}
