import { useLocalSearchParams } from 'expo-router';
import { PhotoDetailScreen } from '@/features/photo';

export default function PhotoDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // id is always a string for this route; Array.isArray guard handles the
  // edge-case where Expo Router returns string[] for repeated params.
  const photoId = Array.isArray(id) ? (id[0] ?? '') : (id ?? '');
  return <PhotoDetailScreen id={photoId} />;
}
