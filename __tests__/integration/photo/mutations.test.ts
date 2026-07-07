import { renderHook, act, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { server } from '../../setup/server';
import { createWrapper } from '../../setup/renderWithProviders';
import { queryKeys } from '@/lib/queryClient';
import { useUpdateMetadata, useDeletePhoto } from '@/features/photo/mutations';
import type { PhotoMetadata, PhotoMetadataEntry } from '@/types';
import type { QueryClient } from '@tanstack/react-query';

let activeQueryClient: QueryClient | null = null;

jest.mock('@/constants', () => ({
  ...jest.requireActual('@/constants'),
  MUTATION_RETRY_UPDATE_METADATA: 0,
  MUTATION_RETRY_DELETE: 0,
}));

afterEach(() => {
  if (activeQueryClient) {
    activeQueryClient.clear();
    activeQueryClient = null;
  }
});

// ─── fixtures ────────────────────────────────────────────────────────────────

const ID = 'photo-1.jpg';

const seedDetail: PhotoMetadata = {
  tags: ['old-tag'],
  updatedAt: '2026-07-01T09:00:00.000Z',
};

const seedAll: PhotoMetadataEntry[] = [
  { id: 'photo-1.jpg', tags: ['old-tag'], updatedAt: '2026-07-01T09:00:00.000Z' },
  { id: 'photo-2.jpg', tags: ['mountain'], updatedAt: '2026-07-01T10:00:00.000Z' },
];

const seedIds = ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg'];

// ─── useUpdateMetadata ───────────────────────────────────────────────────────

describe('useUpdateMetadata — optimistic update', () => {
  it('writes optimistic tags to the detail cache immediately', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;

    // Seed caches
    queryClient.setQueryData(queryKeys.metadata.detail(ID), seedDetail);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useUpdateMetadata(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: ID, tags: ['new-tag'] });
    });

    // Optimistic update should be visible before the server responds
    await waitFor(() => {
      const detail = queryClient.getQueryData<PhotoMetadata>(
        queryKeys.metadata.detail(ID),
      );
      expect(detail?.tags).toEqual(['new-tag']);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('updates the matching entry in the all-metadata cache optimistically', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.metadata.detail(ID), seedDetail);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useUpdateMetadata(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: ID, tags: ['updated'] });
    });

    await waitFor(() => {
      const all = queryClient.getQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
      );
      const entry = all?.find(e => e.id === ID);
      expect(entry?.tags).toEqual(['updated']);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('mutation succeeds and resolves with updated metadata from server', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.metadata.detail(ID), seedDetail);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useUpdateMetadata(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: ID, tags: ['server-tag'] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.tags).toEqual(['server-tag']);
  });
});

describe('useUpdateMetadata — rollback on error', () => {
  it('restores the original detail cache when the server returns an error', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    server.use(
      http.put('http://localhost:3000/metadata/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    queryClient.setQueryData(queryKeys.metadata.detail(ID), seedDetail);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useUpdateMetadata(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: ID, tags: ['should-be-rolled-back'] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const detail = queryClient.getQueryData<PhotoMetadata>(
      queryKeys.metadata.detail(ID),
    );
    // Rolled back to original
    expect(detail?.tags).toEqual(['old-tag']);
  });

  it('restores the original metadata.all cache when the server returns an error', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    server.use(
      http.put('http://localhost:3000/metadata/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    queryClient.setQueryData(queryKeys.metadata.detail(ID), seedDetail);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useUpdateMetadata(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: ID, tags: ['should-be-rolled-back'] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const all = queryClient.getQueryData<PhotoMetadataEntry[]>(
      queryKeys.metadata.all(),
    );
    const entry = all?.find(e => e.id === ID);
    expect(entry?.tags).toEqual(['old-tag']);
  });
});

// ─── useDeletePhoto ──────────────────────────────────────────────────────────

describe('useDeletePhoto — optimistic removal', () => {
  it('removes the ID from the photos.ids cache immediately', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.photos.ids(), seedIds);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useDeletePhoto(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(ID);
    });

    await waitFor(() => {
      const ids = queryClient.getQueryData<string[]>(queryKeys.photos.ids());
      expect(ids).not.toContain(ID);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('removes the entry from the metadata.all cache immediately', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.photos.ids(), seedIds);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useDeletePhoto(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(ID);
    });

    await waitFor(() => {
      const all = queryClient.getQueryData<PhotoMetadataEntry[]>(
        queryKeys.metadata.all(),
      );
      expect(all?.find(e => e.id === ID)).toBeUndefined();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('mutation resolves successfully', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.photos.ids(), seedIds);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useDeletePhoto(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(ID);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeletePhoto — rollback on error', () => {
  it('restores photos.ids cache when the server returns an error', async () => {
    server.use(
      http.delete('http://localhost:3000/photos/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.photos.ids(), seedIds);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useDeletePhoto(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(ID);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const ids = queryClient.getQueryData<string[]>(queryKeys.photos.ids());
    expect(ids).toContain(ID);
    expect(ids).toHaveLength(seedIds.length);
  });

  it('restores metadata.all cache when the server returns an error', async () => {
    server.use(
      http.delete('http://localhost:3000/photos/:id', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    queryClient.setQueryData(queryKeys.photos.ids(), seedIds);
    queryClient.setQueryData(queryKeys.metadata.all(), seedAll);

    const { result } = await renderHook(() => useDeletePhoto(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(ID);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const all = queryClient.getQueryData<PhotoMetadataEntry[]>(
      queryKeys.metadata.all(),
    );
    expect(all?.find(e => e.id === ID)).toBeDefined();
    expect(all).toHaveLength(seedAll.length);
  });
});
