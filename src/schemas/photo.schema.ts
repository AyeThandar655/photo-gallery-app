import { z } from 'zod';


export const PhotoIdSchema = z.string().min(1);

export const PhotoIdsResponseSchema = z.array(PhotoIdSchema);

export const UploadPhotoBodySchema = z.object({
  uri: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const UploadPhotoResponseSchema = z.object({
  id: z.string().min(1),
  updatedAt: z.string(),
  tags: z.array(z.string()),
});
