/**
 * TanStack Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Financial reports: 5 min stale, 30 min garbage collection
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      // Refetch when app comes to foreground
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});
