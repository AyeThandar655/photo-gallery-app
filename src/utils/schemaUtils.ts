import type { z } from 'zod';
import type { Result } from '@/types';
import { createAppError } from './errorUtils';

export function safeParseResponse<T>(
  schema: z.ZodType<T, any, any>,
  data: unknown,
): Result<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldSummary = result.error.issues
    .slice(0, 3)
    .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ');

  return {
    success: false,
    error: createAppError('VALIDATION_ERROR', {
      message: `API response did not match expected shape (${fieldSummary}).`,
      originalError: result.error,
    }),
  };
}
