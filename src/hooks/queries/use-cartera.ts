/**
 * useCartera — Snapshot de Cartera (AR aging).
 *
 * Por ahora consume el mock. Cuando exista la edge function que envuelva
 * QB AgedReceivables, sustituir queryFn manteniendo el contrato.
 */

import { useQuery } from '@tanstack/react-query';
import { getCarteraMock } from '@/src/services/mock/cartera.mock';
import type { CarteraSnapshot } from '@/src/types/cartera.types';

export function useCartera() {
  return useQuery<CarteraSnapshot>({
    queryKey: ['cartera', 'snapshot'],
    queryFn: getCarteraMock,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
