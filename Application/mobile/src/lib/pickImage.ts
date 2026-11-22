import * as ImagePicker from 'expo-image-picker';

/** Opens the photo library. Returns local file uris (empty if cancelled or permission was denied). */
export async function pickImages(opts: { multiple?: boolean; max?: number; square?: boolean } = {}): Promise<string[]> {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return [];
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: !!opts.multiple,
      selectionLimit: opts.max ?? 1,
      allowsEditing: !opts.multiple && !!opts.square,
      aspect: opts.square ? [1, 1] : undefined,
      quality: 0.7,
    });
    if (res.canceled) return [];
    return res.assets.map((a) => a.uri);
  } catch {
    return [];
  }
}
