/**
 * Integration tests for features/photo/services.ts
 *
 * Coverage:
 *   fetchMetadata   — success, 404 → null, schema error, server error
 *   updateMetadata  — success (returns updated PhotoMetadata), server error, schema error
 *   deletePhoto     — success (void), 404, server error
 */
import { http, HttpResponse } from 'msw';
import { server } from '../../setup/server';
import { fetchMetadata, updateMetadata, deletePhoto } from '@/features/photo/services';

const ID = 'photo-1.jpg';
const UPDATED_AT = '2026-07-01T10:00:00.000Z';

/** Minimal AppError shape — all thrown errors must match this. */
const appErrorMatcher = { type: expect.any(String), message: expect.any(String) };

describe('fetchMetadata', () => {
  it('returns metadata object on success', async () => {
    const metadata = await fetchMetadata(ID);
    expect(metadata).not.toBeNull();
    expect(metadata?.tags).toEqual(['sunset', 'beach']);
    expect(metadata?.updatedAt).toBe(UPDATED_AT);
  });

  it('returns null when the server responds 404', async () => {
    const metadata = await fetchMetadata('nonexistent.jpg');
    expect(metadata).toBeNull();
  });

  it('throws an AppError when the server returns malformed data', async () => {
    server.use(
      // tags must be string[], so passing a number array fails validation
      http.get('http://localhost:3000/metadata/:id', () =>
        HttpResponse.json({ tags: [1, 2, 3] }),
      ),
    );

    await expect(fetchMetadata(ID)).rejects.toMatchObject(appErrorMatcher);
  });

  it('throws an AppError on 500 server error', async () => {
    server.use(
      http.get('http://localhost:3000/metadata/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(fetchMetadata(ID)).rejects.toMatchObject(appErrorMatcher);
  });
});

describe('updateMetadata', () => {
  it('returns PhotoMetadata constructed from sent tags on success', async () => {
    const newTags = ['street', 'art'];
    const result = await updateMetadata(ID, newTags);

    expect(result.tags).toEqual(newTags);
    expect(typeof result.updatedAt).toBe('string');
  });

  it('throws an AppError on server error', async () => {
    server.use(
      http.put('http://localhost:3000/metadata/:id', () =>
        new HttpResponse(null, { status: 422 }),
      ),
    );

    await expect(updateMetadata(ID, ['tag'])).rejects.toMatchObject(appErrorMatcher);
  });

  it('throws an AppError on network failure', async () => {
    server.use(
      http.put('http://localhost:3000/metadata/:id', () =>
        HttpResponse.error(),
      ),
    );

    await expect(updateMetadata(ID, ['tag'])).rejects.toMatchObject(appErrorMatcher);
  });
});

describe('deletePhoto', () => {
  it('resolves void on 204 success', async () => {
    await expect(deletePhoto(ID)).resolves.toBeUndefined();
  });

  it('throws an AppError on 404 not found', async () => {
    server.use(
      http.delete('http://localhost:3000/photos/:id', () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );

    await expect(deletePhoto('missing.jpg')).rejects.toMatchObject(appErrorMatcher);
  });

  it('throws an AppError on server error', async () => {
    server.use(
      http.delete('http://localhost:3000/photos/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(deletePhoto(ID)).rejects.toMatchObject(appErrorMatcher);
  });
});
