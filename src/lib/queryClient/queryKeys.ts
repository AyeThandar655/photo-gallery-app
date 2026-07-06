
export const queryKeys = {
  photos: {
    ids: () => ['photos', 'ids'] as const,
  },
  metadata: {
    all: () => ['metadata', 'all'] as const,
    detail: (id: string) => ['metadata', id] as const,
  },
} as const;
