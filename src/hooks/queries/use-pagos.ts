/**
 * usePagos — Snapshot del Informe Pagos.
 */

import { useQuery } from '@tanstack/react-query';
import { getPagosMock } from '@/src/services/mock/pagos.mock';
import type { PagosSnapshot } from '@/src/types/pagos.types';
import { queryKeys } from './query-keys';

export function usePagos() {
  return useQuery<PagosSnapshot>({
    queryKey: queryKeys.pagosSnapshot(),
    queryFn: getPagosMock,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
