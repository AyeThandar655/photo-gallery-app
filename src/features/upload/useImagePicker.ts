import { useState } from 'react';
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';

export type PickedAsset = ImagePickerAsset;

export interface UseImagePickerResult {
  asset: PickedAsset | null;
  pick: () => Promise<void>;
  clear: () => void;
  permissionGranted: boolean;
}

export function useImagePicker(): UseImagePickerResult {
  const [asset, setAsset] = useState<PickedAsset | null>(null);
  const [permissionResponse, requestPermission] = useMediaLibraryPermissions();

  const pick = async (): Promise<void> => {
    if (!permissionResponse?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const first = result.assets[0];
      if (first !== undefined) {
        setAsset(first);
      }
    }
  };

  const clear = () => setAsset(null);

  return {
    asset,
    pick,
    clear,
    permissionGranted: permissionResponse?.granted ?? false,
  };
}
