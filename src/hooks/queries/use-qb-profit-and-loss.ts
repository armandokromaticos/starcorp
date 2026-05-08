import { useQuery } from '@tanstack/react-query';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import type { QBProfitAndLossRaw } from '@/src/types/api.types';
import { queryKeys } from './query-keys';

export function useQBProfitAndLoss(params: {
  start_date: string;
  end_date: string;
}) {
  return useQuery({
    queryKey: queryKeys.qbProfitAndLoss(params.start_date, params.end_date),
    queryFn: async () => {
      try {
        return await qbQuery<QBProfitAndLossRaw>(
          'reports/ProfitAndLoss',
          params,
        );
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
