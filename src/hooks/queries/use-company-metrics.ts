import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockCompanyMetrics } from '@/src/services/mock/data.mock';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { normalizeMetricsFromPnL } from '@/src/services/quickbooks/normalizer';
import { QB_COMPANY_ID } from './use-companies';
import type { QBProfitAndLossRaw } from '@/src/types/api.types';
import type { CompanyMetrics } from '@/src/types/domain.types';

export function useCompanyMetrics(companyId: string | undefined) {
  const period = useFiltersStore((s) => s.activePeriod);

  return useQuery<CompanyMetrics | undefined>({
    queryKey: queryKeys.companyMetrics(period.key, companyId ?? ''),
    queryFn: async () => {
      if (!companyId) return undefined;

      if (companyId === QB_COMPANY_ID) {
        try {
          const pnl = await qbQuery<QBProfitAndLossRaw>('reports/ProfitAndLoss', {
            start_date: period.start,
            end_date: period.end,
          });
          return normalizeMetricsFromPnL(pnl);
        } catch (e) {
          if (
            e instanceof QBNotConnectedError ||
            e instanceof QBReauthRequiredError
          ) return undefined;
          throw e;
        }
      }

      return mockCompanyMetrics[companyId];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
