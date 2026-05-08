/**
 * useThirdParties — terceros (nits) within one cost/gasto group for a
 * specific client+category+period. Backed by get_group_terceros RPC.
 *
 * Used by /costos/[clientId]/[groupId] and /gastos/[clientId]/[groupId].
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/config/supabase';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { tokens } from '@/src/theme/tokens';
import type {
  ConsolidadoCategoryId,
  PeriodKey,
  ThirdParty,
} from '@/src/types/domain.types';
import type { DashboardSummaryPeriod } from './use-dashboard-summary';

const RPC_PERIOD: Record<PeriodKey, DashboardSummaryPeriod> = {
  today: 'mtd',
  '1w': '1w',
  '1m': '1m',
  '3m': '3m',
  '12m': '12m',
};

interface RpcRow {
  nit: string;
  razon_social: string;
  amount: number | string;
  amount_prev: number | string;
  delta_percent: number | string;
}

export function useThirdParties(
  categoryId: ConsolidadoCategoryId,
  groupId: string,
  clientId: string,
) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);
  const period = RPC_PERIOD[periodKey];
  const centroCosto = decodeURIComponent(clientId ?? '');
  const cat = categoryId === 'egresos' ? 'costos' : categoryId;

  return useQuery<ThirdParty[]>({
    queryKey: queryKeys.thirdParties(periodKey, categoryId, groupId),
    queryFn: async () => {
      if (
        !centroCosto ||
        !groupId ||
        (cat !== 'costos' && cat !== 'gastos')
      ) {
        return [];
      }
      const { data, error } = await supabase.rpc('get_group_terceros', {
        p_centro_costo: centroCosto,
        p_group_code: groupId,
        p_category: cat,
        p_period: period,
        p_compare: false,
      });
      if (error) throw error;
      const rows = (data ?? []) as RpcRow[];
      const palette = tokens.color.chart;
      return rows.map((r, i) => ({
        id: r.nit,
        name: r.razon_social,
        color: palette[i % palette.length],
        amount: Number(r.amount),
      }));
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
