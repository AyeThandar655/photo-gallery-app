import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { STALE_TIME_METADATA } from '@/constants';
import type { AppError } from '@/types';
import type { PhotoId, PhotoMetadata } from '@/types';
import { fetchMetadata } from './services';

export function usePhotoMetadata(id: PhotoId) {
  return useQuery<PhotoMetadata | null, AppError>({
    queryKey: queryKeys.metadata.detail(id),
    queryFn: () => fetchMetadata(id),
    staleTime: STALE_TIME_METADATA,
    enabled: id.length > 0,
  });
}
