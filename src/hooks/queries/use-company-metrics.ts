import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockCompanyMetrics } from '@/src/services/mock/data.mock';
import type { CompanyMetrics } from '@/src/types/domain.types';

export function useCompanyMetrics(companyId: string | undefined) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<CompanyMetrics | undefined>({
    queryKey: queryKeys.companyMetrics(periodKey, companyId ?? ''),
    queryFn: async () => (companyId ? mockCompanyMetrics[companyId] : undefined),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
