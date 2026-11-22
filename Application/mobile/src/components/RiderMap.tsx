import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { interpolateRoute, type Point } from '../lib/riderRoute';
import { radii } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { Text } from './Text';

interface Props {
  from: Point;
  to: Point;
  fromLabel: string;
  toLabel: string;
  riderName: string;
}

const H = 190;
const PAD = 34;
const STEPS = 28;
const TOTAL_MIN = 14;

/**
 * Delivery facade: a simulated rider moves along a route between the farm and the buyer.
 * Drawn with SVG so it works offline; positions come from interpolateRoute().
 */
export function RiderMap({ from, to, fromLabel, toLabel, riderName }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  const pts = useMemo(() => {
    if (!w) return [];
    const raw = interpolateRoute(from, to, STEPS);
    const lats = raw.map((p) => p[0]);
    const lngs = raw.map((p) => p[1]);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const sx = (w - PAD * 2) / (maxLng - minLng || 1);
    const sy = (H - PAD * 2) / (maxLat - minLat || 1);
    const s = Math.min(sx, sy);
    const base = raw.map(([lat, lng]) => ({ x: w / 2 + (lng - (minLng + maxLng) / 2) * s, y: H / 2 - (lat - (minLat + maxLat) / 2) * s }));
    // roads are rarely straight: bend the straight line sideways a little
    const dx = base[base.length - 1].x - base[0].x;
    const dy = base[base.length - 1].y - base[0].y;
    const len = Math.hypot(dx, dy) || 1;
    return base.map((p, i) => {
      const tt = i / STEPS;
      const off = Math.sin(tt * Math.PI * 2) * 16 * Math.min(1, len / 120);
      return { x: p.x + (-dy / len) * off, y: p.y + (dx / len) * off };
    });
  }, [w, from, to]);

  useEffect(() => {
    if (!pts.length) return;
    x.setValue(pts[0].x);
    y.setValue(pts[0].y);
    setIdx(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i >= pts.length) {
        clearInterval(timer);
        return;
      }
      setIdx(i);
      Animated.parallel([
        Animated.timing(x, { toValue: pts[i].x, duration: 900, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(y, { toValue: pts[i].y, duration: 900, easing: Easing.linear, useNativeDriver: false }),
      ]).start();
    }, 900);
    return () => clearInterval(timer);
  }, [pts, x, y]);

  const d = pts.length ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') : '';
  const minutes = Math.max(1, Math.round(((STEPS - idx) / STEPS) * TOTAL_MIN));
  const arrived = idx >= STEPS;

  return (
    <View testID="rider-map" style={{ borderRadius: radii.card, overflow: 'hidden', backgroundColor: colors.sectionGreen, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ height: H }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {pts.length ? (
          <>
            <Svg width={w} height={H} style={{ position: 'absolute' }}>
              <Path d={d} stroke={colors.eyebrow} strokeWidth={4} strokeDasharray="2 9" strokeLinecap="round" fill="none" opacity={0.85} />
              <Circle cx={pts[0].x} cy={pts[0].y} r={7} fill={colors.sun} />
              <Circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={7} fill={colors.accent} />
            </Svg>
            <Text style={{ position: 'absolute', left: pts[0].x - 14, top: pts[0].y - 38, fontSize: 24 }}>🧑‍🌾</Text>
            <Text style={{ position: 'absolute', left: pts[pts.length - 1].x - 14, top: pts[pts.length - 1].y - 38, fontSize: 24 }}>🏠</Text>
            <Animated.Text style={{ position: 'absolute', left: -14, top: -16, fontSize: 28, transform: [{ translateX: x }, { translateY: y }] }}>🛵</Animated.Text>
            <Text variant="caption" style={{ position: 'absolute', left: 10, bottom: 8, fontSize: 10.5 }}>
              {fromLabel}
            </Text>
            <Text variant="caption" style={{ position: 'absolute', right: 10, bottom: 8, fontSize: 10.5 }}>
              {toLabel}
            </Text>
          </>
        ) : null}
      </View>
      <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface }}>
        <View>
          <Text variant="label">{arrived ? '✓ ' + t('order.status.completed') : t('order.riderOnTheWay')}</Text>
          <Text variant="caption">
            {t('order.rider')}: {riderName}
          </Text>
        </View>
        {!arrived ? (
          <Text variant="subtitle" color="accent">
            ~{minutes} min
          </Text>
        ) : null}
      </View>
    </View>
  );
}
