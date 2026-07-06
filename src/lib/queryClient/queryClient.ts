
import { QueryClient } from '@tanstack/react-query';
import { GC_TIME, STALE_TIME_METADATA } from '@/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_METADATA,
      gcTime: GC_TIME,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
