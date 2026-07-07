import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './testQueryClient';
import type { QueryClient } from '@tanstack/react-query';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: client,
  };
}

/**
 * renderHook wrapper — returns the queryClient alongside the RTL result so tests
 * can inspect / seed the cache directly.
 */
export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    );
  }

  return { Wrapper, queryClient: client };
}
