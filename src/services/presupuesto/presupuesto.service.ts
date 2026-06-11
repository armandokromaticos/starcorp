/**
 * Presupuesto Service
 *
 * Informe Presupuesto, alimentado por la tabla `PROYECCION` de Power BI
 * (mismo dataset que el consolidado). Con EXPO_PUBLIC_USE_MOCKS=true
 * (default) retorna mocks; en false ejecuta DAX vía la Edge Function
 * `powerbi-execute-query` (inyecta el token Azure del service principal y
 * valida el JWT del usuario).
 *
 * Hechos confirmados contra el dataset (probe 2026-06):
 *   - [TIPO DE MOVIMIENTO] ∈ { "INGRESO", "GASTO", (null) }  → filtramos.
 *   - [AÑO] es texto ("2026"); [MES] es nombre en español MAYÚSCULAS.
 *   - Valores en millones; [CONCEPTO]/[COMENTARIO] pueden venir null.
 *
 * Período: "mes corriente" = último (AÑO,MES) con datos; "mes pasado" = el
 * anterior. (El calendario real puede adelantarse a los datos cargados;
 * ver TODO si BI prefiere mes calendario estricto.)
 */

import { getAccessToken } from '@/src/config/supabase';
import { withMock } from '@/src/services/mock/mock-adapter';
import { getPresupuestoMock } from '@/src/services/mock/presupuesto.mock';
import type {
  PresupuestoData,
  PresupuestoEmpresa,
  PresupuestoCentroCosto,
  PresupuestoQuery,
  PresupuestoTipo,
} from '@/src/types/presupuesto.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// PROYECCION vive en el dataset del consolidado (overridable por env).
const DATASET_ID =
  process.env.EXPO_PUBLIC_PRESUPUESTO_DATASET_ID ||
  '43f822cf-7162-410d-bc5a-61182e5ca2d7';
const GROUP_ID =
  process.env.EXPO_PUBLIC_PRESUPUESTO_GROUP_ID ||
  '457b264f-6eb8-4b00-8f62-f65ee2700cd4';

const TIPO_DAX_VALUE: Record<PresupuestoTipo, string> = {
  ingreso: 'INGRESO',
  gasto: 'GASTO',
};

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

function mesIndex(name: string): number {
  return MESES.indexOf((name || '').trim().toUpperCase());
}

// ─── Edge Function call ──────────────────────────────────────────

interface DAXRaw {
  results?: { tables?: { rows?: Record<string, unknown>[] }[] }[];
}

async function executeDax(daxQuery: string): Promise<Record<string, unknown>[]> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/powerbi-execute-query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ datasetId: DATASET_ID, daxQuery, groupId: GROUP_ID }),
  });
  if (!res.ok) {
    throw new Error(`[presupuesto] execute-query ${res.status}: ${await res.text()}`);
  }
  const raw = (await res.json()) as DAXRaw;
  return raw.results?.[0]?.tables?.[0]?.rows ?? [];
}

// ─── Row helpers (SUMMARIZECOLUMNS devuelve 'PROYECCION'[X] y "[alias]") ─

function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    for (const rk of Object.keys(row)) {
      if (rk === k || rk.endsWith(`[${k}]`)) return row[rk];
    }
  }
  return undefined;
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── DAX builders ────────────────────────────────────────────────

/** Totales de EJECUTADO/PROYECTADO por (AÑO,MES) para un tipo — resuelve
 *  el período activo y la variación mes a mes. */
function buildMonthlyTotalsDax(tipo: PresupuestoTipo): string {
  const tipoValue = TIPO_DAX_VALUE[tipo];
  return `
EVALUATE
SUMMARIZECOLUMNS(
  'PROYECCION'[AÑO],
  'PROYECCION'[MES],
  KEEPFILTERS(FILTER(ALL('PROYECCION'[TIPO DE MOVIMIENTO]), 'PROYECCION'[TIPO DE MOVIMIENTO] = "${tipoValue}")),
  "Ejec", SUM('PROYECCION'[EJECUTADO]),
  "Proy", SUM('PROYECCION'[PROYECTADO])
)`.trim();
}

/** Detalle EMPRESA × CENTRO DE COSTOS para un tipo + (AÑO,MES). */
function buildSummaryDax(
  tipo: PresupuestoTipo,
  anio: string,
  mes: string,
): string {
  const tipoValue = TIPO_DAX_VALUE[tipo];
  return `
EVALUATE
SUMMARIZECOLUMNS(
  'PROYECCION'[EMPRESA],
  'PROYECCION'[CENTRO DE COSTOS],
  'PROYECCION'[CONCEPTO],
  'PROYECCION'[CATEGORIA],
  'PROYECCION'[COMENTARIO],
  KEEPFILTERS(FILTER(ALL('PROYECCION'[TIPO DE MOVIMIENTO]), 'PROYECCION'[TIPO DE MOVIMIENTO] = "${tipoValue}")),
  KEEPFILTERS(FILTER(ALL('PROYECCION'[AÑO]), 'PROYECCION'[AÑO] = "${anio}")),
  KEEPFILTERS(FILTER(ALL('PROYECCION'[MES]), 'PROYECCION'[MES] = "${mes}")),
  "Proyectado", SUM('PROYECCION'[PROYECTADO]),
  "Ejecutado", SUM('PROYECCION'[EJECUTADO])
)`.trim();
}

// ─── Parsing ─────────────────────────────────────────────────────

interface MonthTotal {
  anio: string;
  mes: string;
  rank: number;
  ejec: number;
  proy: number;
}

function parseMonthTotals(rows: Record<string, unknown>[]): MonthTotal[] {
  return rows
    .map((r) => {
      const anio = str(pick(r, 'AÑO'));
      const mes = str(pick(r, 'MES'));
      return {
        anio,
        mes,
        rank: Number(anio) * 100 + (mesIndex(mes) + 1),
        ejec: num(pick(r, 'Ejec')),
        proy: num(pick(r, 'Proy')),
      };
    })
    .filter((m) => m.anio && mesIndex(m.mes) >= 0)
    .sort((a, b) => b.rank - a.rank); // más reciente primero
}

function buildEmpresasFromRows(
  rows: Record<string, unknown>[],
  query: PresupuestoQuery,
): PresupuestoEmpresa[] {
  const byEmpresa = new Map<string, PresupuestoEmpresa>();
  rows.forEach((row, idx) => {
    const empresa = str(pick(row, 'EMPRESA')) || 'Sin empresa';
    const proyectado = num(pick(row, 'Proyectado'));
    const ejecutado = num(pick(row, 'Ejecutado'));
    const centro: PresupuestoCentroCosto = {
      id: `${empresa}-${idx}`,
      centroCostos: str(pick(row, 'CENTRO DE COSTOS')) || '—',
      proyectado,
      ejecutado,
      concepto: str(pick(row, 'CONCEPTO')),
      categoria: str(pick(row, 'CATEGORIA')),
      porcentajeEje:
        proyectado > 0 ? round2((ejecutado / proyectado) * 100) : 0,
      comentario: str(pick(row, 'COMENTARIO')),
    };

    const existing = byEmpresa.get(empresa);
    if (existing) {
      existing.centrosCosto.push(centro);
      existing.proyectado += proyectado;
      existing.ejecutado += ejecutado;
    } else {
      byEmpresa.set(empresa, {
        id: empresa,
        empresa,
        tipo: query.tipo,
        tipoLabel: query.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
        proyectado,
        ejecutado,
        centrosCosto: [centro],
      });
    }
  });
  return [...byEmpresa.values()].sort((a, b) => b.ejecutado - a.ejecutado);
}

// ─── Public API ──────────────────────────────────────────────────

export async function fetchPresupuesto(
  query: PresupuestoQuery,
): Promise<PresupuestoData> {
  return withMock(
    async () => {
      const months = parseMonthTotals(
        await executeDax(buildMonthlyTotalsDax(query.tipo)),
      );
      if (months.length === 0) {
        return {
          tipo: query.tipo,
          periodo: query.periodo,
          empresas: [],
          totalProyectado: 0,
          totalEjecutado: 0,
          ejecucion: { ejecutado: 0, proyectado: 0, fraction: 0, deltaPct: 0 },
        };
      }

      // corriente = mes más reciente; pasado = el anterior.
      const targetIdx = query.periodo === 'corriente' ? 0 : 1;
      const target = months[Math.min(targetIdx, months.length - 1)];
      const prev = months[Math.min(targetIdx, months.length - 1) + 1];

      const rows = await executeDax(
        buildSummaryDax(query.tipo, target.anio, target.mes),
      );
      const empresas = buildEmpresasFromRows(rows, query);

      const totalProyectado = target.proy;
      const totalEjecutado = target.ejec;
      const fraction =
        totalProyectado > 0
          ? Math.max(0, Math.min(1, totalEjecutado / totalProyectado))
          : 0;
      const deltaPct =
        prev && prev.ejec !== 0
          ? round2(((target.ejec - prev.ejec) / Math.abs(prev.ejec)) * 100)
          : 0;

      return {
        tipo: query.tipo,
        periodo: query.periodo,
        empresas,
        totalProyectado,
        totalEjecutado,
        ejecucion: {
          ejecutado: totalEjecutado,
          proyectado: totalProyectado,
          fraction,
          deltaPct,
        },
      };
    },
    () => getPresupuestoMock(query),
  );
}
