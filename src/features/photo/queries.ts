import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import type { AppError, PhotoId, PhotoMetadata } from '@/types';
import { fetchMetadata } from './services';

export function usePhotoMetadata(id: PhotoId) {
  return useQuery<PhotoMetadata | null, AppError>({
    queryKey: queryKeys.metadata.detail(id),
    queryFn: () => fetchMetadata(id),
    enabled: id.length > 0,
  });
}
