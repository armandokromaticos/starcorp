/**
 * Hooks: VAG (hub + Activos, Movimientos, Ctas. por cobrar/pagar).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/hooks/queries/query-keys';
import {
  getVagActivos,
  getVagCuentas,
  getVagMovimientos,
  getVagResumen,
} from '@/src/services/empresas/vag.service';
import type { VagCuentaTipo } from '@/src/types/vag.types';

const STALE = 5 * 60 * 1000;

export function useVagResumen() {
  return useQuery({
    queryKey: queryKeys.vagResumen(),
    queryFn: getVagResumen,
    staleTime: STALE,
  });
}

export function useVagActivos() {
  return useQuery({
    queryKey: queryKeys.vagActivos(),
    queryFn: getVagActivos,
    staleTime: STALE,
  });
}

export function useVagMovimientos() {
  return useQuery({
    queryKey: queryKeys.vagMovimientos(),
    queryFn: getVagMovimientos,
    staleTime: STALE,
  });
}

export function useVagCuentas(tipo: VagCuentaTipo) {
  return useQuery({
    queryKey: queryKeys.vagCuentas(tipo),
    queryFn: () => getVagCuentas(tipo),
    staleTime: STALE,
  });
}
