import {
  PhotoMetadataSchema,
  PhotoMetadataEntrySchema,
  MetadataListResponseSchema,
  UpdateMetadataBodySchema,
} from '@/schemas';

// PhotoMetadataSchema 

describe('PhotoMetadataSchema', () => {
  it('accepts a valid metadata object', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: ['nature', 'landscape'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.updatedAt).toBe('2026-07-01T12:00:00.000Z');
      expect(result.data.tags).toEqual(['nature', 'landscape']);
    }
  });

  it('accepts an empty tags array', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: [],
    });
    expect(result.success).toBe(true);
  });

  it('provides empty string default when updatedAt is missing', () => {
    const result = PhotoMetadataSchema.safeParse({ tags: ['test'] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.updatedAt).toBe('');
  });

  it('provides empty array default when tags is missing', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it('rejects when tags contains a non-string item', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: ['valid', 42],
    });
    expect(result.success).toBe(false);
  });

  it('rejects when updatedAt is not a string', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: 1720310400000,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects null', () => {
    expect(PhotoMetadataSchema.safeParse(null).success).toBe(false);
  });

  it('strips unknown fields (Zod default strip behaviour)', () => {
    const result = PhotoMetadataSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: [],
      unknownField: 'should be removed',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('unknownField' in result.data).toBe(false);
    }
  });
});

// PhotoMetadataEntrySchema

describe('PhotoMetadataEntrySchema', () => {
  it('accepts server list format { id, metadata: { tags, updatedAt } }', () => {
    const result = PhotoMetadataEntrySchema.safeParse({
      id: 'abc123.jpg',
      metadata: { tags: ['sky'], updatedAt: '2026-07-01T12:00:00.000Z' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('abc123.jpg');
      expect(result.data.tags).toEqual(['sky']);
      expect(result.data.updatedAt).toBe('2026-07-01T12:00:00.000Z');
    }
  });

  it('accepts empty metadata object and provides defaults', () => {
    const result = PhotoMetadataEntrySchema.safeParse({
      id: 'abc123.jpg',
      metadata: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.updatedAt).toBe('');
    }
  });

  it('rejects when id is missing', () => {
    const result = PhotoMetadataEntrySchema.safeParse({
      metadata: { tags: [], updatedAt: '2026-07-01T12:00:00.000Z' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects when id is an empty string', () => {
    const result = PhotoMetadataEntrySchema.safeParse({
      id: '',
      metadata: {},
    });
    expect(result.success).toBe(false);
  });
});

// MetadataListResponseSchema

describe('MetadataListResponseSchema', () => {
  it('accepts an empty array', () => {
    const result = MetadataListResponseSchema.safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it('accepts an array of valid entries in server format', () => {
    const result = MetadataListResponseSchema.safeParse([
      { id: 'a.jpg', metadata: { tags: ['x'], updatedAt: '2026-07-01T12:00:00.000Z' } },
      { id: 'b.jpg', metadata: { tags: [],    updatedAt: '2026-07-02T12:00:00.000Z' } },
    ]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(2);
  });

  it('rejects if any item is missing id', () => {
    const result = MetadataListResponseSchema.safeParse([
      { id: 'a.jpg', metadata: { tags: ['x'] } },
      { metadata: { tags: [] } }, // missing id
    ]);
    expect(result.success).toBe(false);
  });

  it('rejects a non-array', () => {
    expect(MetadataListResponseSchema.safeParse({}).success).toBe(false);
    expect(MetadataListResponseSchema.safeParse(null).success).toBe(false);
  });
});

// UpdateMetadataBodySchema

describe('UpdateMetadataBodySchema', () => {
  it('accepts a valid update body', () => {
    const result = UpdateMetadataBodySchema.safeParse({ tags: ['a', 'b'] });
    expect(result.success).toBe(true);
  });

  it('accepts an empty tags array', () => {
    const result = UpdateMetadataBodySchema.safeParse({ tags: [] });
    expect(result.success).toBe(true);
  });

  it('rejects when tags is missing', () => {
    const result = UpdateMetadataBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects when tags is not an array', () => {
    const result = UpdateMetadataBodySchema.safeParse({ tags: 'single-tag' });
    expect(result.success).toBe(false);
  });

  it('does not accept updatedAt — it is server-computed', () => {
    // Zod strips unknown fields, so even if sent it won't be in the output.
    const result = UpdateMetadataBodySchema.safeParse({
      tags: ['x'],
      updatedAt: '2026-07-01T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('updatedAt' in result.data).toBe(false);
    }
  });
});
