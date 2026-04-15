/**
 * useRevenue — TanStack Query hook
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockRevenue } from '@/src/services/mock/data.mock';
import type { NormalizedRevenue } from '@/src/types/domain.types';

export function useRevenue() {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<NormalizedRevenue>({
    queryKey: queryKeys.revenue(periodKey),
    queryFn: async () => {
      // TODO: Replace with financeRepository.getRevenue() when backend is ready
      return mockRevenue;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
