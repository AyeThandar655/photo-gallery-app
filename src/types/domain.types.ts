import type { z } from 'zod';
import type {
  PhotoMetadataSchema,
  PhotoMetadataEntrySchema,
  UpdateMetadataBodySchema,
  UploadPhotoBodySchema,
  UploadPhotoResponseSchema,
} from '@/schemas';

export type PhotoId = string;

export type PhotoMetadata = z.infer<typeof PhotoMetadataSchema>;

export type PhotoMetadataEntry = z.infer<typeof PhotoMetadataEntrySchema>;

export type UpdateMetadataBody = z.infer<typeof UpdateMetadataBodySchema>;

export type UploadPhotoBody = z.infer<typeof UploadPhotoBodySchema>;

export type UploadPhotoResponse = z.infer<typeof UploadPhotoResponseSchema>;
