import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import {
  mockThirdParties,
  mockThirdPartiesEgresos,
} from '@/src/services/mock/data.mock';
import type { ConsolidadoCategoryId, ThirdParty } from '@/src/types/domain.types';

export function useThirdParties(
  categoryId: ConsolidadoCategoryId,
  groupId: string,
) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<ThirdParty[]>({
    queryKey: queryKeys.thirdParties(periodKey, categoryId, groupId),
    queryFn: async () => {
      const source =
        categoryId === 'egresos' ? mockThirdPartiesEgresos : mockThirdParties;
      return source[groupId] ?? [];
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
