import type { PhotoId, PhotoMetadata } from '@/types';

export type GalleryItem = {
  id: PhotoId;
  imageUri: string;
  metadata: PhotoMetadata | null;
};
