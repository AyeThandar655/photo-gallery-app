import { apiClient } from '@/lib/api';
import { ENDPOINTS } from '@/lib/api';
import { PhotoIdsResponseSchema, MetadataListResponseSchema } from '@/schemas';
import type { PhotoId, PhotoMetadataEntry } from '@/types';
import { isAppError, isNotFoundError, safeParseResponse } from '@/utils';

export async function fetchPhotoIds(): Promise<PhotoId[]> {
  const response = await apiClient.get<unknown>(ENDPOINTS.photos.list);
  const result = safeParseResponse(PhotoIdsResponseSchema, response.data);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export async function fetchAllMetadata(): Promise<PhotoMetadataEntry[]> {
  try {
    const response = await apiClient.get<unknown>(ENDPOINTS.metadata.all);
    const result = safeParseResponse(MetadataListResponseSchema, response.data);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  } catch (error) {
    if (isAppError(error) && isNotFoundError(error)) {
      return [];
    }
    throw error;
  }
}

export function getPhotoImageUri(id: PhotoId): string {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  return `${base}/photos/${id}`;
}
