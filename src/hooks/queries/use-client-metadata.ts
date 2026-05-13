/**
 * useClientMetadata — all-time aggregate stats for one centro_costo.
 * Used by client detail screens to populate Terceros / Movimientos / Vigencia.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/config/supabase';

export interface ClientMetadata {
  nTerceros: number;
  nCuentas: number;
  nEntries: number;
  firstFecha: string | null;
  lastFecha: string | null;
  idCentroCosto: string | null;
  /** Raw row from clientes_master.data (PBI ListadoClientes5Stars). */
  clienteData: Record<string, unknown> | null;
}

interface MetadataRow {
  n_terceros: number | string;
  n_cuentas: number | string;
  n_entries: number | string;
  first_fecha: string | null;
  last_fecha: string | null;
  id_centro_costo: string | null;
  cliente_data: Record<string, unknown> | null;
}

export function useClientMetadata(centroCosto: string | null) {
  return useQuery<ClientMetadata | null>({
    queryKey: ['clientMetadata', centroCosto],
    queryFn: async () => {
      if (!centroCosto) return null;
      const { data, error } = await supabase.rpc('get_client_metadata', {
        p_centro_costo: centroCosto,
      });
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as
        | MetadataRow
        | undefined;
      if (!row) return null;
      return {
        nTerceros: Number(row.n_terceros),
        nCuentas: Number(row.n_cuentas),
        nEntries: Number(row.n_entries),
        firstFecha: row.first_fecha,
        lastFecha: row.last_fecha,
        idCentroCosto: row.id_centro_costo ?? null,
        clienteData: row.cliente_data ?? null,
      };
    },
    enabled: !!centroCosto,
    staleTime: 30 * 60 * 1000,
  });
}
