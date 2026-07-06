import { QueryClient } from '@tanstack/react-query';
import { GC_TIME, STALE_TIME_METADATA } from '@/constants';
import { smartRetry, retryDelay } from './retry';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_METADATA,
      gcTime: GC_TIME,
      retry: smartRetry,
      retryDelay,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});
