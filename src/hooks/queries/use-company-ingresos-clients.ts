import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockIngresoClientesByCompany } from '@/src/services/mock/data.mock';
import type { IngresoCliente } from '@/src/types/domain.types';

export function useCompanyIngresosClients(companyId: string | undefined) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<IngresoCliente[]>({
    queryKey: queryKeys.companyIngresosClients(periodKey, companyId ?? ''),
    queryFn: async () =>
      companyId ? mockIngresoClientesByCompany[companyId] ?? [] : [],
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
