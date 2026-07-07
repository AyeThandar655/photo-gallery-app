import { useCallback, useMemo } from 'react';
import type { AppError } from '@/types';
import { usePhotoIds, useAllMetadata } from './queries';
import { getPhotoImageUri } from './services';
import type { GalleryItem } from './types';

export type UseGalleryResult = {
  items: GalleryItem[];
  isLoading: boolean;
  isRefetching: boolean;
  error: AppError | null;
  refetch: () => void;
};

export function useGallery(): UseGalleryResult {
  const idsQuery = usePhotoIds();
  const metadataQuery = useAllMetadata();

  const items = useMemo<GalleryItem[]>(() => {
    const ids = idsQuery.data;
    if (!ids) return [];

    const metadataMap = new Map(
      (metadataQuery.data ?? []).map(entry => [entry.id, entry]),
    );

    return ids.map(id => {
      const entry = metadataMap.get(id);
      return {
        id,
        imageUri: getPhotoImageUri(id),
        metadata: entry !== undefined
          ? { updatedAt: entry.updatedAt, tags: entry.tags }
          : null,
      };
    });
  }, [idsQuery.data, metadataQuery.data]);

  const isLoading = idsQuery.isLoading || metadataQuery.isLoading;
  const isRefetching =
    !isLoading && (idsQuery.isRefetching || metadataQuery.isRefetching);

  const error: AppError | null =
    idsQuery.error ?? metadataQuery.error ?? null;

  const refetch = useCallback(() => {
    void idsQuery.refetch();
    void metadataQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsQuery.refetch, metadataQuery.refetch]);

  return { items, isLoading, isRefetching, error, refetch };
}
