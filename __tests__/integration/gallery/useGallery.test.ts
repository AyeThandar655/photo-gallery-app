import { renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { server, PHOTO_IDS, METADATA_LIST } from '../../setup/server';
import { createWrapper } from '../../setup/renderWithProviders';
import { useGallery } from '@/features/gallery/useGallery';
import type { QueryClient } from '@tanstack/react-query';

let activeQueryClient: QueryClient | null = null;

afterEach(() => {
  if (activeQueryClient) {
    activeQueryClient.clear();
    activeQueryClient = null;
  }
});

describe('useGallery', () => {
  it('starts in loading state', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns items joined from photo IDs and metadata', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // All 3 IDs from PHOTO_IDS fixture should appear
    expect(result.current.items).toHaveLength(PHOTO_IDS.length);

    const first = result.current.items[0];
    expect(first?.id).toBe('photo-1.jpg');
    // imageUri is derived, not fetched
    expect(first?.imageUri).toBe('http://localhost:3000/photos/photo-1.jpg');
    // Metadata was matched from METADATA_LIST
    expect(first?.metadata?.tags).toEqual(METADATA_LIST[0]?.tags);
  });

  it('sets metadata to null for photos with no matching metadata entry', async () => {
    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // photo-3.jpg is in PHOTO_IDS but NOT in METADATA_LIST
    const third = result.current.items.find(item => item.id === 'photo-3.jpg');
    expect(third).toBeDefined();
    expect(third?.metadata).toBeNull();
  });

  it('surfaces an error when the photos endpoint fails', async () => {
    server.use(
      http.get('http://localhost:3000/photos', () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.items).toEqual([]);
  });

  it('surfaces an error when the metadata endpoint fails (non-404)', async () => {
    server.use(
      http.get('http://localhost:3000/metadata', () =>
        new HttpResponse(null, { status: 503 }),
      ),
    );

    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
  });

  it('still returns items when metadata endpoint returns 404 (treated as empty list)', async () => {
    server.use(
      http.get('http://localhost:3000/metadata', () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );

    const { Wrapper, queryClient } = createWrapper();
    activeQueryClient = queryClient;
    const { result } = await renderHook(() => useGallery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // All photos present, all with metadata: null
    expect(result.current.items).toHaveLength(PHOTO_IDS.length);
    expect(result.current.error).toBeNull();
    result.current.items.forEach(item => {
      expect(item.metadata).toBeNull();
    });
  });
});
