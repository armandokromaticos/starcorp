import { useQueries } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useCompanies } from './use-companies';
import { useFiltersStore } from '@/src/stores/filters.store';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { normalizeMetricsFromPnL } from '@/src/services/quickbooks/normalizer';
import type { QBProfitAndLossRaw } from '@/src/types/api.types';
import type { CompanySummary } from '@/src/components/organisms/or-financiero-section';

const REALM_ID_PATTERN = /^\d{6,}$/;

/**
 * Fetches per-company P&L for every connected QuickBooks company in parallel
 * and returns CompanySummary[] ready to feed OrFinancieroSection.
 */
export function useCompanySummaries() {
  const { data: companies = [] } = useCompanies();
  const period = useFiltersStore((s) => s.activePeriod);

  const realmCompanies = companies.filter((c) => REALM_ID_PATTERN.test(c.id));

  const queries = useQueries({
    queries: realmCompanies.map((c) => ({
      queryKey: [
        ...queryKeys.companyMetrics(period.key, c.id),
        'summary',
      ] as const,
      queryFn: async () => {
        try {
          const pnl = await qbQuery<QBProfitAndLossRaw>(
            'reports/ProfitAndLoss',
            { start_date: period.start, end_date: period.end },
            c.id,
          );
          return normalizeMetricsFromPnL(pnl);
        } catch (e) {
          if (
            e instanceof QBNotConnectedError ||
            e instanceof QBReauthRequiredError
          ) return null;
          throw e;
        }
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const summaries: CompanySummary[] = realmCompanies.map((c, i) => {
    const m = queries[i]?.data;
    return {
      id: c.id,
      name: c.name,
      totalLabel: 'Ingresos totales',
      totalValue: m?.ingresos.value ?? 0,
      deltaPercent: m?.ingresos.deltaPercent ?? 0,
    };
  });

  return {
    summaries,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
