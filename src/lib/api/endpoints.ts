/**
 * All API paths as typed constants.
 *   GET    /photos          → list all photo IDs
 *   GET    /photos/:id      → serve binary image file (used as Image URI, not fetched)
 *   POST   /photos          → upload photo + metadata
 *   DELETE /photos/:id      → delete photo + its metadata file
 *   GET    /metadata        → all metadata objects
 *   GET    /metadata/:id    → single photo's metadata
 *   PUT    /metadata/:id    → update single photo's metadata
 */

export const ENDPOINTS = {
  photos: {
    list: '/photos',
    detail: (id: string) => `/photos/${id}`,
  },
  metadata: {
    all: '/metadata',
    detail: (id: string) => `/metadata/${id}`,
  },
} as const;
