/**
 * useCategoryRevenue — TanStack Query hook
 *
 * Returns the NormalizedRevenue for a given category (ingresos, costos,
 * gastos, utilidad). Used by the dashboard chart card so the radio
 * selection in the category carousel can swap the rendered dataset.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockCategoryRevenues, mockRevenue } from '@/src/services/mock/data.mock';
import type { NormalizedRevenue } from '@/src/types/domain.types';

export function useCategoryRevenue(categoryId: string) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<NormalizedRevenue>({
    queryKey: [...queryKeys.revenue(periodKey), categoryId],
    queryFn: async () => mockCategoryRevenues[categoryId] ?? mockRevenue,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
