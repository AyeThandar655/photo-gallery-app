import { z } from 'zod';

export const PhotoMetadataSchema = z.object({
  updatedAt: z.string(),
  tags: z.array(z.string()),
});


export const PhotoMetadataEntrySchema = PhotoMetadataSchema.extend({
  id: z.string().min(1),
});


export const MetadataListResponseSchema = z.array(PhotoMetadataEntrySchema);

export const UpdateMetadataBodySchema = z.object({
  tags: z.array(z.string()),
});
