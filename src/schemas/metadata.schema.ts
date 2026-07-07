import { z } from 'zod';

export const PhotoMetadataSchema = z.object({
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).transform(data => ({
  updatedAt: data.updatedAt ?? '',
  tags: data.tags ?? [],
}));

// Server list response shape: { id, metadata: { tags?, updatedAt? } }
const PhotoMetadataEntryRawSchema = z.object({
  id: z.string().min(1),
  metadata: z.object({
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export const PhotoMetadataEntrySchema = PhotoMetadataEntryRawSchema.transform(
  ({ id, metadata }) => ({
    id,
    tags: metadata?.tags ?? [],
    updatedAt: metadata?.updatedAt ?? '',
  }),
);

export const MetadataListResponseSchema = z.array(PhotoMetadataEntrySchema);

export const UpdateMetadataBodySchema = z.object({
  tags: z.array(z.string()),
});
