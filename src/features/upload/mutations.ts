import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { MUTATION_RETRY_UPLOAD } from '@/constants';
import type { AppError, UploadPhotoBody, UploadPhotoResponse } from '@/types';
import { uploadPhoto } from './services';

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation<UploadPhotoResponse, AppError, UploadPhotoBody>({
    mutationFn: uploadPhoto,
    retry: MUTATION_RETRY_UPLOAD,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.photos.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.metadata.root() });
    },
  });
}
