import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { STALE_TIME_IDS } from '@/constants';
import type { PhotoId, PhotoMetadataEntry, AppError } from '@/types';
import { fetchPhotoIds, fetchAllMetadata } from './services';

export function usePhotoIds() {
  return useQuery<PhotoId[], AppError>({
    queryKey: queryKeys.photos.ids(),
    queryFn: fetchPhotoIds,
    staleTime: STALE_TIME_IDS,
  });
}

export function useAllMetadata() {
  return useQuery<PhotoMetadataEntry[], AppError>({
    queryKey: queryKeys.metadata.all(),
    queryFn: fetchAllMetadata,
  });
}
