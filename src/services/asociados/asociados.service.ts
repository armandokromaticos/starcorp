/**
 * asociados.service — Snapshot del Informe Asociados activos.
 *
 * Real path: RPC get_asociados_snapshot (Supabase), que agrupa los empleados
 * activos (Retirement Date IS NULL) de empleados_detail por cliente
 * (Sub Account). Datos sincronizados de PBI empleadosHotel por la edge function
 * pbi-sync-empleados. El color de cada cliente se asigna aquí (la paleta es
 * presentación, no dato del RPC).
 */

import { supabase } from '@/src/config/supabase';
import { withMock } from '@/src/services/mock/mock-adapter';
import { getAsociadosMock } from '@/src/services/mock/asociados.mock';
import type {
  AsociadoClient,
  AsociadosSnapshot,
} from '@/src/types/asociados.types';

const PALETTE = [
  '#9B2C2C', // wine
  '#1A2B6D', // navy
  '#0E7490', // teal
  '#65A30D', // lime
  '#D9E021', // yellow-lime
  '#3B82F6', // azure
  '#0B1F4A', // dark navy
  '#F6AD55', // amber
  '#7C3AED', // purple
  '#DC2626', // red
  '#059669', // emerald
  '#A16207', // ochre
];

interface RpcEmployee {
  id: string;
  name: string;
  area: string;
  codigoInterno: string;
}

interface RpcClient {
  id: string;
  name: string;
  account: string | null;
  employees: RpcEmployee[];
}

interface RpcSnapshot {
  updatedAt: string;
  clients: RpcClient[];
}

async function fetchFromPBI(): Promise<AsociadosSnapshot> {
  const { data, error } = await supabase.rpc('get_asociados_snapshot');
  if (error) throw error;
  const snap = (data ?? { updatedAt: '', clients: [] }) as RpcSnapshot;

  // El RPC ya ordena clientes por nombre, así que el color por índice es
  // estable entre cargas.
  const clients: AsociadoClient[] = (snap.clients ?? []).map((c, i) => ({
    id: c.id,
    name: c.name,
    account: c.account ?? null,
    color: PALETTE[i % PALETTE.length],
    employees: c.employees ?? [],
  }));

  return { updatedAt: snap.updatedAt, clients };
}

export async function getAsociadosSnapshot(): Promise<AsociadosSnapshot> {
  return withMock(fetchFromPBI, () => getAsociadosMock());
}
