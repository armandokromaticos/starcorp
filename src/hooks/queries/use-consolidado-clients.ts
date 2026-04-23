import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockConsolidadoClients } from '@/src/services/mock/data.mock';
import type { ConsolidadoCategoryId, ConsolidadoClient } from '@/src/types/domain.types';

export function useConsolidadoClients(categoryId: ConsolidadoCategoryId) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<ConsolidadoClient[]>({
    queryKey: queryKeys.consolidadoClients(periodKey, categoryId),
    queryFn: async () => mockConsolidadoClients[categoryId] ?? [],
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
