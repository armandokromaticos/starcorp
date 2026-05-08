/**
 * useReports — TanStack Query hook
 *
 * Returns the full list of report categories (cartera, asociados,
 * bancos, presupuesto, seguro, pagos) plus chart data (one bar per
 * category colored by category). Drives the Informes card: the sidebar
 * acts as a legend and the bar chart stays fixed while the user
 * selects which category's value to highlight.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockReports } from '@/src/services/mock/data.mock';
import type { NormalizedReport } from '@/src/types/domain.types';
import type { BarDatum } from '@/src/components/charts/bar-chart';

interface ReportsData {
  reports: NormalizedReport[];
  chartData: BarDatum[];
}

export function useReports() {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<NormalizedReport[], Error, ReportsData>({
    queryKey: [...queryKeys.report('all'), periodKey],
    queryFn: async () => mockReports,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    select: (data) => ({
      reports: data,
      chartData: data.map((r) => ({ value: r.total, color: r.color })),
    }),
  });
}
