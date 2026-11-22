import React, { useRef, useState } from 'react';
import { FlatList, Pressable, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { ProductArt } from './ProductArt';

interface Props {
  title: string;
  category: string;
  photos: string[];
  width: number;
  height: number;
  onPressImage?: (index: number) => void;
}

/** Swipeable photos with page dots. With no photos it shows the emoji art once. */
export function Carousel({ title, category, photos, width, height, onPressImage }: Props) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList<string | null>>(null);
  const data: (string | null)[] = photos.length ? photos : [null];

  function onEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View style={{ width, height }}>
      <FlatList
        ref={ref}
        testID="carousel"
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p, i) => `${p ?? 'art'}-${i}`}
        onMomentumScrollEnd={onEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <Pressable disabled={!onPressImage || !photos.length} onPress={() => onPressImage?.(i)}>
            <ProductArt title={title} category={category} photo={item} width={width} height={height} emojiSize={height * 0.42} />
          </Pressable>
        )}
      />
      {data.length > 1 ? (
        <View style={{ position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {data.map((_, i) => (
            <View key={i} style={{ width: i === index ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? colors.sun : 'rgba(255,255,255,0.6)' }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
