import { z } from 'zod';
import { safeParseResponse } from '@/utils';

const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
});

// ─── safeParseResponse ────────────────────────────────────────────────────────

describe('safeParseResponse', () => {
  it('returns success: true with typed data when schema matches', () => {
    const result = safeParseResponse(UserSchema, { id: 'u1', name: 'Aye' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('u1');
      expect(result.data.name).toBe('Aye');
    }
  });

  it('returns success: false with VALIDATION_ERROR when schema fails', () => {
    const result = safeParseResponse(UserSchema, { id: 'u1' }); // missing name
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('VALIDATION_ERROR');
      expect(result.error.retryable).toBe(false);
    }
  });

  it('error message includes the failing field path', () => {
    const result = safeParseResponse(UserSchema, { id: '', name: 'Aye' }); // empty id
    expect(result.success).toBe(false);
    if (!result.success) {
      // The id field failed — the message should reference it
      expect(result.error.message).toMatch(/id/);
    }
  });

  it('returns success: false for null input', () => {
    const result = safeParseResponse(UserSchema, null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('VALIDATION_ERROR');
    }
  });

  it('works with array schemas', () => {
    const ArraySchema = z.array(z.string());
    const ok = safeParseResponse(ArraySchema, ['a', 'b']);
    expect(ok.success).toBe(true);

    const fail = safeParseResponse(ArraySchema, [1, 2]);
    expect(fail.success).toBe(false);
  });

  it('strips unknown fields (Zod default) and still succeeds', () => {
    const result = safeParseResponse(UserSchema, {
      id: 'u1',
      name: 'Aye',
      extra: 'should be stripped',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('extra' in result.data).toBe(false);
    }
  });

  it('originalError on the AppError is the ZodError instance', () => {
    const result = safeParseResponse(UserSchema, null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.originalError).toBeInstanceOf(z.ZodError);
    }
  });
});
