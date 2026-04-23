import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import {
  mockCostGroups,
  mockCostGroupsEgresos,
} from '@/src/services/mock/data.mock';
import type { ConsolidadoCategoryId, CostGroup } from '@/src/types/domain.types';

export function useCostGroups(
  categoryId: ConsolidadoCategoryId,
  clientId: string,
) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<CostGroup[]>({
    queryKey: queryKeys.costGroups(periodKey, categoryId, clientId),
    queryFn: async () =>
      categoryId === 'egresos' ? mockCostGroupsEgresos : mockCostGroups,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
