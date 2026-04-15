/**
 * useCashFlow — TanStack Query hook
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockCashFlow } from '@/src/services/mock/data.mock';
import type { NormalizedCashFlow } from '@/src/types/domain.types';

export function useCashFlow() {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<NormalizedCashFlow>({
    queryKey: queryKeys.cashFlow(periodKey),
    queryFn: async () => {
      // TODO: Replace with financeRepository.getCashFlow() when backend is ready
      return mockCashFlow;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
