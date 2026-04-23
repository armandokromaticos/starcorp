import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockExpenseCentral } from '@/src/services/mock/data.mock';
import type { ExpenseCentral } from '@/src/types/domain.types';

export function useExpenseCentral() {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<ExpenseCentral>({
    queryKey: queryKeys.expenseCentral(periodKey),
    queryFn: async () => mockExpenseCentral,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
