import {
  PhotoIdSchema,
  PhotoIdsResponseSchema,
  UploadPhotoBodySchema,
  UploadPhotoResponseSchema,
} from '@/schemas';

// PhotoIdSchema

describe('PhotoIdSchema', () => {
  it('accepts a valid photo id', () => {
    expect(PhotoIdSchema.safeParse('1720312800000.jpg').success).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(PhotoIdSchema.safeParse('').success).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(PhotoIdSchema.safeParse(42).success).toBe(false);
    expect(PhotoIdSchema.safeParse(null).success).toBe(false);
  });
});

// PhotoIdsResponseSchema 

describe('PhotoIdsResponseSchema', () => {
  it('accepts an empty array', () => {
    const result = PhotoIdsResponseSchema.safeParse([]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it('accepts an array of ids', () => {
    const result = PhotoIdsResponseSchema.safeParse([
      '1720312800000.jpg',
      '1720312900000.jpg',
    ]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(2);
  });

  it('rejects an array containing an empty string', () => {
    const result = PhotoIdsResponseSchema.safeParse(['valid.jpg', '']);
    expect(result.success).toBe(false);
  });

  it('rejects a non-array', () => {
    expect(PhotoIdsResponseSchema.safeParse('single-id').success).toBe(false);
    expect(PhotoIdsResponseSchema.safeParse(null).success).toBe(false);
  });
});

// UploadPhotoBodySchema 

describe('UploadPhotoBodySchema', () => {
  const validBody = {
    uri: 'file:///var/mobile/photos/image.jpg',
    type: 'image/jpeg',
    name: 'photo.jpg',
    tags: ['sunset'],
  };

  it('accepts a valid upload body', () => {
    const result = UploadPhotoBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uri).toBe(validBody.uri);
      expect(result.data.tags).toEqual(['sunset']);
    }
  });

  it('rejects when tags is omitted (required field, no default)', () => {
    const result = UploadPhotoBodySchema.safeParse({
      uri: 'file:///path/image.jpg',
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    expect(result.success).toBe(false);
  });

  it('accepts tags as an empty array', () => {
    const result = UploadPhotoBodySchema.safeParse({
      uri: 'file:///path/image.jpg',
      type: 'image/jpeg',
      name: 'photo.jpg',
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it('rejects when uri is missing', () => {
    const { uri: _uri, ...rest } = validBody;
    expect(UploadPhotoBodySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects when uri is an empty string', () => {
    expect(
      UploadPhotoBodySchema.safeParse({ ...validBody, uri: '' }).success,
    ).toBe(false);
  });

  it('rejects when type is missing', () => {
    const { type: _type, ...rest } = validBody;
    expect(UploadPhotoBodySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects when name is missing', () => {
    const { name: _name, ...rest } = validBody;
    expect(UploadPhotoBodySchema.safeParse(rest).success).toBe(false);
  });

  it('rejects when tags is not an array', () => {
    expect(
      UploadPhotoBodySchema.safeParse({ ...validBody, tags: 'tag1' }).success,
    ).toBe(false);
  });
});

// UploadPhotoResponseSchema 

describe('UploadPhotoResponseSchema', () => {
  it('accepts a valid upload response', () => {
    const result = UploadPhotoResponseSchema.safeParse({
      id: '1720312800000.jpg',
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: ['sunset'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('1720312800000.jpg');
    }
  });

  it('rejects when id is missing', () => {
    const result = UploadPhotoResponseSchema.safeParse({
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects when id is an empty string', () => {
    const result = UploadPhotoResponseSchema.safeParse({
      id: '',
      updatedAt: '2026-07-01T12:00:00.000Z',
      tags: [],
    });
    expect(result.success).toBe(false);
  });
});
