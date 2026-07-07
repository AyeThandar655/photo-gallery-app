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
  refetchIds: () => void;
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

  // Destructure stable refetch references before useCallback deps to satisfy
  // react-hooks/exhaustive-deps without eslint-disable comments.
  const { refetch: refetchIdsQuery } = idsQuery;
  const { refetch: refetchMetadataQuery } = metadataQuery;

  // Full refetch — used by pull-to-refresh.
  const refetch = useCallback(() => {
    void refetchIdsQuery();
    void refetchMetadataQuery();
  }, [refetchIdsQuery, refetchMetadataQuery]);

  // IDs-only refetch — used by useFocusEffect so that returning from the
  // edit screen does NOT overwrite the mutation's optimistic metadata cache
  // with a stale GET /metadata response.
  const refetchIds = useCallback(() => {
    void refetchIdsQuery();
  }, [refetchIdsQuery]);

  return { items, isLoading, isRefetching, error, refetch, refetchIds };
}
