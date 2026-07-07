import { apiClient, ENDPOINTS } from '@/lib/api';
import { UploadPhotoResponseSchema } from '@/schemas';
import type { UploadPhotoBody, UploadPhotoResponse } from '@/types';
import { safeParseResponse } from '@/utils';

export async function uploadPhoto(body: UploadPhotoBody): Promise<UploadPhotoResponse> {
  const formData = new FormData();

  formData.append(
    'photo',
    { uri: body.uri, type: body.type, name: body.name } as unknown as Blob,
  );

  for (const tag of body.tags) {
    formData.append('tags', tag);
  }

  const response = await apiClient.post<unknown>(ENDPOINTS.photos.list, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const result = safeParseResponse(UploadPhotoResponseSchema, response.data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
