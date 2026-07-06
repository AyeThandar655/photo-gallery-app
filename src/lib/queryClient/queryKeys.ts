export const queryKeys = {
  photos: {
    all: () => ['photos'] as const,
    ids: () => ['photos', 'ids'] as const,
  },
  metadata: {
    root: () => ['metadata'] as const,
    all: () => ['metadata', 'all'] as const,
    detail: (id: string) => ['metadata', 'detail', id] as const,
  },
} as const;
