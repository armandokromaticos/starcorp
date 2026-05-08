import { useQuery } from '@tanstack/react-query';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import type { QBCustomersRaw } from '@/src/types/api.types';
import { queryKeys } from './query-keys';

export function useQBCustomers() {
  return useQuery({
    queryKey: queryKeys.qbCustomers(),
    queryFn: async () => {
      try {
        return await qbQuery<QBCustomersRaw>('query', {
          query: 'select * from Customer maxresults 50',
        });
      } catch (e) {
        if (
          e instanceof QBNotConnectedError ||
          e instanceof QBReauthRequiredError
        ) return null;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
