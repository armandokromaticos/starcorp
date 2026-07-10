/**
 * Service: VAG
 *
 * Fuente real: RPCs get_vag_* sobre vag_activos/vag_movimientos (sync
 * diario de las tablas curadas ListadoActivosVag y MovimientosVag de
 * Power BI vía pbi-sync-vag). Cuentas por cobrar / por pagar aún no
 * tienen fuente → mock; el resumen del hub mezcla RPC (activos y
 * movimientos) con el mock (CxC/CxP).
 */

import { supabase } from '@/src/config/supabase';
import { withMock } from '@/src/services/mock/mock-adapter';
import {
  getVagActivosMock,
  getVagCuentasMock,
  getVagMovimientosMock,
  getVagResumenMock,
} from '@/src/services/mock/vag.mock';
import type {
  VagActivo,
  VagCuenta,
  VagCuentaTipo,
  VagMovimiento,
  VagResumen,
} from '@/src/types/vag.types';

// ── Formas crudas de los RPCs ────────────────────────────────────────
interface RpcMetric {
  total: number;
  delta_pct: number;
}

interface RpcResumen {
  activos: RpcMetric;
  movimientos: RpcMetric;
}

interface RpcActivoMovimiento {
  id: number;
  fecha: string;
  nombre: string;
  valor: number;
}

interface RpcActivo {
  id: string;
  nombre: string;
  tipo: string;
  fecha_adquisicion: string | null;
  valor_adquisicion: number | null;
  valor_estimado: number | null;
  valor_contable: number | null;
  avaluo_catastral: number | null;
  valor_predial: number | null;
  valor_seguro: number | null;
  vigencia: string | null;
  aseguradora: string | null;
  ciudad: string | null;
  direccion: string | null;
  matricula: string | null;
  ficha_catastral: string | null;
  movimientos: RpcActivoMovimiento[];
}

interface RpcMovimiento {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  valor: number;
  subpartida: string;
  tercero: string;
  observaciones: string;
}

/** ISO yyyy-mm-dd → dd/mm/yyyy (formato de las cards). */
function formatFecha(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ── Fetchers reales ──────────────────────────────────────────────────
async function fetchResumen(): Promise<VagResumen> {
  const { data, error } = await supabase.rpc('get_vag_resumen');
  if (error) throw new Error(`get_vag_resumen: ${error.message}`);
  const r = data as RpcResumen;
  const metric = (m: RpcMetric) => ({
    total: Number(m.total),
    deltaPct: Number(m.delta_pct),
  });
  // CxC/CxP sin fuente aún → métricas del mock.
  const mock = getVagResumenMock();
  return {
    activos: metric(r.activos),
    movimientos: metric(r.movimientos),
    cuentasCobrar: mock.cuentasCobrar,
    cuentasPagar: mock.cuentasPagar,
  };
}

async function fetchActivos(): Promise<VagActivo[]> {
  const { data, error } = await supabase.rpc('get_vag_activos');
  if (error) throw new Error(`get_vag_activos: ${error.message}`);
  return (data as RpcActivo[]).map((a) => ({
    id: a.id,
    nombre: a.nombre,
    tipo: a.tipo,
    fechaAdquisicion: formatFecha(a.fecha_adquisicion) ?? '--',
    valorAdquisicion: Number(a.valor_adquisicion ?? 0),
    valorEstimado: a.valor_estimado == null ? null : Number(a.valor_estimado),
    valorContable: Number(a.valor_contable ?? 0),
    avaluoCatastral:
      a.avaluo_catastral == null ? null : Number(a.avaluo_catastral),
    valorPredial: a.valor_predial == null ? null : Number(a.valor_predial),
    valorSeguro: a.valor_seguro == null ? null : Number(a.valor_seguro),
    vigencia: formatFecha(a.vigencia),
    aseguradora: a.aseguradora,
    ciudad: a.ciudad,
    direccion: a.direccion,
    numeroMatricula: a.matricula,
    fichaCatastral: a.ficha_catastral ? { numero: a.ficha_catastral } : null,
    gruposMovimientos: a.movimientos.length
      ? [
          {
            id: `${a.id}-movs`,
            titulo: 'Movimientos',
            subpartida: a.tipo,
            items: a.movimientos.map((m) => ({
              id: String(m.id),
              nombre: m.nombre,
              monto: Number(m.valor),
              movimientoId: String(m.id),
            })),
          },
        ]
      : [],
  }));
}

async function fetchMovimientos(): Promise<VagMovimiento[]> {
  const { data, error } = await supabase.rpc('get_vag_movimientos');
  if (error) throw new Error(`get_vag_movimientos: ${error.message}`);
  return (data as RpcMovimiento[]).map((m) => ({
    id: String(m.id),
    nombre: m.nombre,
    tipo: m.tipo,
    fecha: m.fecha,
    valor: Number(m.valor),
    subpartida: m.subpartida,
    tercero: m.tercero,
    observaciones: m.observaciones,
  }));
}

// ── API pública (mock-aware, mismo criterio que el resto de servicios) ─
export function getVagResumen(): Promise<VagResumen> {
  return withMock(fetchResumen, getVagResumenMock);
}

export function getVagActivos(): Promise<VagActivo[]> {
  return withMock(fetchActivos, getVagActivosMock);
}

export function getVagMovimientos(): Promise<VagMovimiento[]> {
  return withMock(fetchMovimientos, getVagMovimientosMock);
}

// Cuentas por cobrar / por pagar: sin fuente aún → mock siempre (con una
// latencia corta para que el skeleton se vea natural).
export function getVagCuentas(tipo: VagCuentaTipo): Promise<VagCuenta[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(getVagCuentasMock(tipo)), 250),
  );
}
