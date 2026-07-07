import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/native';

const BASE = 'http://localhost:3000';

// Re-usable fixture data
export const PHOTO_IDS = ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'];

// Server returns list items as { id, metadata: { tags, updatedAt } }
export const METADATA_LIST = [
  { id: 'photo-1.jpg', metadata: { tags: ['sunset', 'beach'], updatedAt: '2026-07-01T10:00:00.000Z' } },
  { id: 'photo-2.jpg', metadata: { tags: ['mountain'],        updatedAt: '2026-07-01T11:00:00.000Z' } },
];

// Server returns single-item endpoint as { tags, updatedAt } directly
export const METADATA_DETAIL = {
  tags: ['sunset', 'beach'],
  updatedAt: '2026-07-01T10:00:00.000Z',
};

// Default happy-path handlers
export const defaultHandlers = [
  // GET /photos → photo IDs
  http.get(`${BASE}/photos`, () =>
    HttpResponse.json(PHOTO_IDS),
  ),

  // GET /metadata → metadata list
  http.get(`${BASE}/metadata`, () =>
    HttpResponse.json(METADATA_LIST),
  ),

  // GET /metadata/:id → single metadata (flat shape, no wrapper)
  http.get(`${BASE}/metadata/:id`, ({ params }) => {
    const entry = METADATA_LIST.find(m => m.id === params['id']);
    if (!entry) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(entry.metadata);
  }),

  // PUT /metadata/:id → { id } (server only confirms id, not full metadata)
  http.put(`${BASE}/metadata/:id`, async ({ params }) => {
    return HttpResponse.json({ id: params['id'] });
  }),

  // DELETE /photos/:id → 204
  http.delete(`${BASE}/photos/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // POST /photos → upload response
  http.post(`${BASE}/photos`, () =>
    HttpResponse.json({
      id: 'new-photo.jpg',
      tags: [],
      updatedAt: new Date().toISOString(),
    }, { status: 201 }),
  ),
];

export const server = setupServer(...defaultHandlers);
