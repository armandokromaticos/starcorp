/**
 * Hook: detalle de una "Otra compañía" (Ingresos/Gastos).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/hooks/queries/query-keys';
import { getEmpresaDetail } from '@/src/services/empresas/empresas.service';
import type { EmpresaDetail } from '@/src/types/empresas.types';

export function useEmpresaDetail(id: string) {
  return useQuery<EmpresaDetail | null>({
    queryKey: queryKeys.otrasEmpresaDetail(id),
    queryFn: () => getEmpresaDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
