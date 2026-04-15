/**
 * Centralized Query Keys
 *
 * All TanStack Query keys in one place for easy invalidation.
 */

export const queryKeys = {
  revenue: (period: string) => ['revenue', period] as const,
  cashFlow: (period: string) => ['cashFlow', period] as const,
  topClients: (period: string, limit: number) =>
    ['topClients', period, limit] as const,
  categories: (period: string) => ['categories', period] as const,
  report: (reportId: string) => ['report', reportId] as const,
  // Prefix for bulk invalidation
  all: ['finance'] as const,
} as const;
