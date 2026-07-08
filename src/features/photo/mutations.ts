import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { MUTATION_RETRY_DELETE, MUTATION_RETRY_UPDATE_METADATA } from '@/constants';
import type { AppError, PhotoId, PhotoMetadata, PhotoMetadataEntry } from '@/types';
import { deletePhoto, updateMetadata } from './services';

interface UpdateMetadataVars {
  id: PhotoId;
  tags: string[];
}

interface UpdateMetadataContext {
  previousDetail: PhotoMetadata | null | undefined;
  previousAll: PhotoMetadataEntry[] | undefined;
}

export function useUpdateMetadata() {
  const queryClient = useQueryClient();

  return useMutation<PhotoMetadata, AppError, UpdateMetadataVars, UpdateMetadataContext>({
    mutationFn: ({ id, tags }) => updateMetadata(id, tags),
    retry: MUTATION_RETRY_UPDATE_METADATA,

    onMutate: async ({ id, tags }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.metadata.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.metadata.all() });

      const previousDetail = queryClient.getQueryData<PhotoMetadata | null>(
        queryKeys.metadata.detail(id),
      );
      const previousAll = queryClient.getQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
      );

      const optimisticTimestamp = new Date().toISOString();

      // Update detail cache.
      queryClient.setQueryData<PhotoMetadata | null>(
        queryKeys.metadata.detail(id),
        (old: PhotoMetadata | null | undefined) =>
          old !== undefined && old !== null
            ? { ...old, tags, updatedAt: optimisticTimestamp }
            : { tags, updatedAt: optimisticTimestamp },
      );

      // Update the matching entry inside metadata.all cache.
      queryClient.setQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
        (old: PhotoMetadataEntry[] | undefined = []) =>
          old.map((entry) =>
            entry.id === id
              ? { ...entry, tags, updatedAt: optimisticTimestamp }
              : entry,
          ),
      );

      return { previousDetail, previousAll };
    },

    onError: (_error, { id }, context) => {
      if (context === undefined) return;

      // Restore detail cache.
      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(queryKeys.metadata.detail(id), context.previousDetail);
      } else {
        queryClient.removeQueries({ queryKey: queryKeys.metadata.detail(id) });
      }

      // Restore metadata.all cache.
      if (context.previousAll !== undefined) {
        queryClient.setQueryData(queryKeys.metadata.all(), context.previousAll);
      }
    },

    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.metadata.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.metadata.all() });
    },
  });
}

// useDeletePhoto 
interface DeleteContext {
  previousIds: PhotoId[] | undefined;
  previousAll: PhotoMetadataEntry[] | undefined;
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, PhotoId, DeleteContext>({
    mutationFn: (id) => deletePhoto(id),
    retry: MUTATION_RETRY_DELETE,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.photos.ids() });
      await queryClient.cancelQueries({ queryKey: queryKeys.metadata.all() });

      const previousIds = queryClient.getQueryData<PhotoId[]>(queryKeys.photos.ids());
      const previousAll = queryClient.getQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
      );

      // Optimistically remove from photos list.
      queryClient.setQueryData<PhotoId[]>(
        queryKeys.photos.ids(),
        (old = []) => old.filter((pid) => pid !== id),
      );

      // Optimistically remove from metadata list.
      queryClient.setQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
        (old: PhotoMetadataEntry[] | undefined = []) => old.filter((entry) => entry.id !== id),
      );

      return { previousIds, previousAll };
    },

    onError: (_error, _id, context) => {
      if (context === undefined) return;

      if (context.previousIds !== undefined) {
        queryClient.setQueryData(queryKeys.photos.ids(), context.previousIds);
      }
      if (context.previousAll !== undefined) {
        queryClient.setQueryData(queryKeys.metadata.all(), context.previousAll);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.photos.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.metadata.root() });
    },
  });
}
