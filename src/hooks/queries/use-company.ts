import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { mockCompanies } from '@/src/services/mock/data.mock';
import type { Company } from '@/src/types/domain.types';

export function useCompany(companyId: string | undefined) {
  return useQuery<Company | undefined>({
    queryKey: queryKeys.company(companyId ?? ''),
    queryFn: async () => mockCompanies.find((c) => c.id === companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
