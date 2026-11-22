import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { BARANGAYS, ZAMBOANGA_CENTER } from '../lib/barangays';
import { buildMapHtml, type MapMarker } from '../lib/mapHtml';
import { useTheme } from '../theme/useTheme';

interface Props {
  markers: MapMarker[];
  onSelect: (id: string | null) => void;
  center?: { lat: number; lng: number };
}

/**
 * Leaflet map inside a WebView. The Leaflet runtime is bundled, so it always renders;
 * OpenStreetMap tiles load when there is internet, and a plain canvas with barangay labels is used when there is not.
 */
export function ListingMap({ markers, onSelect, center = ZAMBOANGA_CENTER }: Props) {
  const { colors, resolved } = useTheme();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    fetch('https://tile.openstreetmap.org/0/0/0.png', { method: 'HEAD', signal: ctrl.signal })
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  const signature = markers.map((m) => `${m.id}:${m.price}`).join('|');
  const html = useMemo(
    () => buildMapHtml(markers, { center: [center.lat, center.lng], online, dark: resolved === 'dark', labels: BARANGAYS }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, online, resolved, center.lat, center.lng],
  );

  function onMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; id?: string };
      if (msg.type === 'select' && msg.id) onSelect(msg.id);
      else if (msg.type === 'blank') onSelect(null);
      else if (msg.type === 'offline') setOnline(false);
    } catch {
      /* ignore malformed messages */
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.sectionGreen }}>
      <WebView
        testID="listing-map"
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://anilink.local/' }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
    </View>
  );
}
