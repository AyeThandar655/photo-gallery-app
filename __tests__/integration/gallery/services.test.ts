/**
 * Integration tests for gallery/services.ts
 *
 * These tests exercise the real service functions through apiClient with MSW
 * intercepting HTTP requests — no mocked modules.
 *
 * Coverage:
 *   fetchPhotoIds    — success, schema validation failure, network error
 *   fetchAllMetadata — success, 404 → [], malformed response, 500 error
 */
import { http, HttpResponse } from 'msw';
import { server, PHOTO_IDS, METADATA_LIST } from '../../setup/server';
import { fetchPhotoIds, fetchAllMetadata } from '@/features/gallery/services';

/** Minimal AppError shape — all thrown errors must match this. */
const appErrorMatcher = { type: expect.any(String), message: expect.any(String) };

describe('fetchPhotoIds', () => {
  it('returns an array of photo IDs on success', async () => {
    const ids = await fetchPhotoIds();
    expect(ids).toEqual(PHOTO_IDS);
  });

  it('throws an AppError when the server returns malformed data', async () => {
    server.use(
      http.get('http://localhost:3000/photos', () =>
        HttpResponse.json({ not: 'an array' }),
      ),
    );

    await expect(fetchPhotoIds()).rejects.toMatchObject(appErrorMatcher);
  });

  it('throws an AppError on network failure', async () => {
    server.use(
      http.get('http://localhost:3000/photos', () =>
        HttpResponse.error(),
      ),
    );

    await expect(fetchPhotoIds()).rejects.toMatchObject(appErrorMatcher);
  });
});

describe('fetchAllMetadata', () => {
  it('returns the full metadata list on success', async () => {
    const list = await fetchAllMetadata();
    expect(list).toHaveLength(METADATA_LIST.length);
    expect(list[0]).toMatchObject({ id: 'photo-1.jpg', tags: ['sunset', 'beach'] });
  });

  it('returns [] when the server responds 404 (no metadata yet)', async () => {
    server.use(
      http.get('http://localhost:3000/metadata', () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );

    const list = await fetchAllMetadata();
    expect(list).toEqual([]);
  });

  it('throws an AppError when the server returns malformed data', async () => {
    server.use(
      http.get('http://localhost:3000/metadata', () =>
        HttpResponse.json({ wrong: 'shape' }),
      ),
    );

    await expect(fetchAllMetadata()).rejects.toMatchObject(appErrorMatcher);
  });

  it('re-throws non-404 HTTP errors as an AppError', async () => {
    server.use(
      http.get('http://localhost:3000/metadata', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    await expect(fetchAllMetadata()).rejects.toMatchObject(appErrorMatcher);
  });
});
