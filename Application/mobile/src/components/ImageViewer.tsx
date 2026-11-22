import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import React from 'react';
import { FlatList, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assetUrl } from '../api/server';

interface Props {
  visible: boolean;
  photos: string[];
  initialIndex?: number;
  onClose: () => void;
}

/** Full-screen photo viewer: swipe between photos, tap the X to close. */
export function ImageViewer({ visible, photos, initialIndex = 0, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' }}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          initialScrollIndex={Math.min(initialIndex, Math.max(photos.length - 1, 0))}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(p, i) => `${p}-${i}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <Image source={{ uri: assetUrl(item) ?? undefined }} style={{ width, height }} contentFit="contain" />}
        />
        <Pressable
          testID="close-viewer"
          onPress={onClose}
          hitSlop={12}
          style={{ position: 'absolute', top: insets.top + 12, right: 16, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}
