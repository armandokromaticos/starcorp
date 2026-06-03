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
import {
  getAsociadosMock,
  getAsociadosTrendMock,
} from '@/src/services/mock/asociados.mock';
import { SEGMENT_PALETTE as PALETTE } from '@/src/theme/gradients';
import type {
  AsociadoClient,
  AsociadosSnapshot,
  AsociadosTrend,
} from '@/src/types/asociados.types';

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

/**
 * Serie de tendencia de asociados por cliente.
 * Real path: RPC get_asociados_trend (historico_emp_cli, de PBI
 * HistoricoEmpXCli vía pbi-sync-historico).
 */
async function fetchTrendFromPBI(): Promise<AsociadosTrend> {
  const { data, error } = await supabase.rpc('get_asociados_trend');
  if (error) throw error;
  const trend = (data ?? {
    updatedAt: '',
    months: [],
    series: [],
  }) as AsociadosTrend;
  return {
    updatedAt: trend.updatedAt ?? '',
    months: trend.months ?? [],
    series: (trend.series ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      counts: (s.counts ?? []).map((n) => Number(n) || 0),
    })),
  };
}

export async function getAsociadosTrend(): Promise<AsociadosTrend> {
  const trend = await withMock(fetchTrendFromPBI, () => getAsociadosTrendMock());
  // Fallback temporal: mientras HistoricoEmpXCli no esté sincronizado a
  // historico_emp_cli (RPC vacío), usa el mock para no mostrar la vista vacía.
  // En cuanto el sync poblé datos reales, estos toman prioridad sin tocar código.
  if (!trend.months.length || !trend.series.length) {
    return getAsociadosTrendMock();
  }
  return trend;
}
