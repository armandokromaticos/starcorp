import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockRevenue } from '@/src/services/mock/data.mock';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { normalizeRevenueFromPnL } from '@/src/services/quickbooks/normalizer';
import type { QBProfitAndLossRaw } from '@/src/types/api.types';
import type { NormalizedRevenue } from '@/src/types/domain.types';

export function useRevenue() {
  const period = useFiltersStore((s) => s.activePeriod);

  return useQuery<NormalizedRevenue>({
    queryKey: queryKeys.revenue(period.key),
    queryFn: async () => {
      try {
        const pnl = await qbQuery<QBProfitAndLossRaw>('reports/ProfitAndLoss', {
          start_date: period.start,
          end_date: period.end,
        });
        return normalizeRevenueFromPnL(pnl, {
          start: period.start,
          end: period.end,
        });
      } catch (e) {
        if (
          e instanceof QBNotConnectedError ||
          e instanceof QBReauthRequiredError
        ) return mockRevenue;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
