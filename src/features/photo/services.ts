import { apiClient } from '@/lib/api';
import { ENDPOINTS } from '@/lib/api';
import { PhotoMetadataSchema } from '@/schemas';
import type { PhotoId, PhotoMetadata } from '@/types';
import { isAppError, isNotFoundError, safeParseResponse } from '@/utils';

/**
 * GET /metadata/:id
 */
export async function fetchMetadata(id: PhotoId): Promise<PhotoMetadata | null> {
  try {
    const response = await apiClient.get<unknown>(ENDPOINTS.metadata.detail(id));
    const result = safeParseResponse(PhotoMetadataSchema, response.data);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  } catch (error) {
    if (isAppError(error) && isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * PUT /metadata/:id
 */
export async function updateMetadata(
  id: PhotoId,
  tags: string[],
): Promise<PhotoMetadata> {
  const response = await apiClient.put<unknown>(
    ENDPOINTS.metadata.detail(id),
    { tags },
  );
  const result = safeParseResponse(PhotoMetadataSchema, response.data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * DELETE /photos/:id
 */
export async function deletePhoto(id: PhotoId): Promise<void> {
  await apiClient.delete(ENDPOINTS.photos.detail(id));
}
