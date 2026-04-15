/**
 * useTopClients — TanStack Query hook
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { useFiltersStore } from '@/src/stores/filters.store';
import { mockTopClients } from '@/src/services/mock/data.mock';
import type { NormalizedClient } from '@/src/types/domain.types';

interface TopClientsData {
  clients: NormalizedClient[];
  total: number;
  chartData: { value: number; color: string; label: string }[];
}

export function useTopClients(limit = 8) {
  const periodKey = useFiltersStore((s) => s.activePeriodKey);

  return useQuery<NormalizedClient[], Error, TopClientsData>({
    queryKey: queryKeys.topClients(periodKey, limit),
    queryFn: async () => {
      // TODO: Replace with clientsRepository.getTopByRevenue() when backend is ready
      return mockTopClients.slice(0, limit);
    },
    select: (data) => ({
      clients: data,
      total: data.reduce((sum, c) => sum + c.revenue, 0),
      chartData: data.map((c) => ({
        value: c.revenue,
        color: c.color,
        label: c.name,
      })),
    }),
  });
}
