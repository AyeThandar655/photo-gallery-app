import { useLocalSearchParams } from 'expo-router';
import { PhotoDetailScreen } from '@/features/photo';

export default function PhotoDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PhotoDetailScreen id={id ?? ''} />;
}
