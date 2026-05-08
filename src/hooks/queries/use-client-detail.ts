import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockClientDetail } from '@/src/services/mock/data.mock';
import type {
  ClientConsolidadoDetail,
  ConsolidadoCategoryId,
} from '@/src/types/domain.types';

export function useClientDetail(
  categoryId: ConsolidadoCategoryId,
  clientId: string,
) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<ClientConsolidadoDetail | undefined>({
    queryKey: queryKeys.clientDetail(periodKey, categoryId, clientId),
    queryFn: async () => mockClientDetail[clientId],
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
