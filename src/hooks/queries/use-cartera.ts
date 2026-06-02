/**
 * useCartera — Snapshot de Cartera (AR aging).
 *
 * El service intercala mock vs QuickBooks vía EXPO_PUBLIC_USE_MOCKS.
 * Real path: agrega facturas con balance > 0 de todos los Realms.
 */

import { useQuery } from '@tanstack/react-query';
import { getCarteraSnapshot } from '@/src/services/cartera/cartera.service';
import type { CarteraSnapshot } from '@/src/types/cartera.types';
import { queryKeys } from './query-keys';

export function useCartera() {
  return useQuery<CarteraSnapshot>({
    queryKey: queryKeys.carteraSnapshot(),
    queryFn: getCarteraSnapshot,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
