import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { mockCompanies } from '@/src/services/mock/data.mock';
import type { Company } from '@/src/types/domain.types';

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: queryKeys.companies(),
    queryFn: async () => mockCompanies,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
