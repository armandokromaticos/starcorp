/**
 * Seguros service — single-table Notion.
 *
 * Toda la data vive en UN tablero (`NOTION_DB_SEGUROS`) con una columna
 * "Tipo de Seguro" que discrimina entre Compañía / Vehículo / Propiedad.
 * Pegamos 1 vez al tablero, bucketeamos por tipo, y normalizamos.
 *
 * Columnas reales de Notion (case-sensitive):
 *   Aa Nombre                Title
 *   📎 Archivos Adjuntos     Files
 *   ≡  Aseguradora           Rich text
 *   ⊙  Broker                Select
 *   #  Costo Total           Number
 *   ⊙  Estado                Select
 *   📅 Fin Vigencia          Date
 *   📅 Inicio Vigencia       Date
 *   ↗  LLC                   Relation (→ empresa)
 *   ≡  Novedades             Rich text
 *   ≡  Numero de Poliza      Rich text
 *   ↗  Plan Póliza           Relation
 *   ⊙  Tipo de Seguro        Select (discriminador)
 *
 * LLC es una relation. Para mostrar el nombre de la empresa en la UI,
 * el usuario puede agregar un rollup "Empresa" o "LLC nombre" en
 * Notion. Mientras tanto, mostramos un fallback derivado del id.
 */

import { withMock } from '@/src/services/mock/mock-adapter';
import { getSegurosMock } from '@/src/services/mock/seguros.mock';
import { notionQueryAll } from '@/src/services/notion/client';
import {
  normalizeRows,
  pickField,
  type NormalizedRow,
} from '@/src/services/notion/normalize';
import type {
  PolizaCompania,
  PolizaPropiedad,
  PolizaVehiculo,
  SeguroEmpresa,
  SegurosSnapshot,
} from '@/src/types/seguros.types';

const DB_SEGUROS = process.env.EXPO_PUBLIC_NOTION_DB_SEGUROS;

// ─── Mapeo Tipo de Seguro → bucket ─────────────────────────────
type Bucket = 'compania' | 'vehiculo' | 'propiedad';

const TIPO_TO_BUCKET: Record<string, Bucket> = {
  GL: 'compania',
  Umbrella: 'compania',
  WC: 'compania',
  'Worker Compensation': 'compania',
  'General Liability': 'compania',
  Vehic: 'vehiculo',
  Vehiculo: 'vehiculo',
  Vehículo: 'vehiculo',
  Auto: 'vehiculo',
  Prop: 'propiedad',
  Propiedad: 'propiedad',
  Property: 'propiedad',
};

const TIPO_TO_NOMBRE_POLIZA: Record<string, string> = {
  GL: 'General Liability',
  WC: 'Worker Compensation',
};

function bucketize(tipo: string | null): Bucket | null {
  if (!tipo) return null;
  const direct = TIPO_TO_BUCKET[tipo];
  if (direct) return direct;
  // Heurística por substring (case-insensitive) para tolerar variantes
  const lower = tipo.toLowerCase();
  if (lower.includes('veh') || lower.includes('auto')) return 'vehiculo';
  if (lower.includes('prop')) return 'propiedad';
  // Resto se considera póliza de compañía
  return 'compania';
}

// ─── Nombres de columnas en Notion ─────────────────────────────
const COL_NOMBRE = ['Nombre'];
const COL_ASEGURADORA = ['Aseguradora'];
const COL_BROKER = ['Broker'];
const COL_NUMERO = ['Numero de Poliza', 'Número de Póliza'];
const COL_VIGENCIA_INICIO = ['Inicio Vigencia'];
const COL_VIGENCIA_FIN = ['Fin Vigencia'];
const COL_COSTO = ['Costo Total'];
const COL_TIPO = ['Tipo de Seguro'];
const COL_LLC = ['LLC'];
// Fallback opcionales si el usuario agrega rollups/columnas extra
const COL_EMPRESA_NOMBRE = ['Empresa', 'LLC nombre', 'Nombre LLC'];
const COL_COBERTURA = ['Cobertura', 'Coverage'];
const COL_PAYROLL = ['Payroll'];
const COL_ASIGNACION = ['Asignación', 'Asignacion'];

// ─── Helpers ───────────────────────────────────────────────────
function toStr(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

const SPANISH_MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Acepta "27 de junio de 2026", "27/06/2026", "2026-06-27", ISO Notion. */
function parseLooseDate(input: unknown): string {
  if (typeof input !== 'string') return '';
  const t = input.trim();
  if (!t) return '';

  // ISO directo (Notion date prop) "2026-06-27" o "2026-06-27T..."
  const isoMatch = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Español "27 de junio de 2026"
  const esMatch = t
    .toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/);
  if (esMatch) {
    const day = parseInt(esMatch[1], 10);
    const month = SPANISH_MONTHS[esMatch[2]];
    const year = parseInt(esMatch[3], 10);
    if (month && Number.isFinite(day) && Number.isFinite(year)) {
      return `${year}-${pad2(month)}-${pad2(day)}`;
    }
  }

  // dd/mm/yyyy o dd-mm-yyyy
  const dmyMatch = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  return '';
}

function toDate(v: unknown): string {
  return parseLooseDate(v);
}

/** Acepta "5091,00 US$", "5,091.00 USD", "$1.000.000", number. */
function parseLooseNumber(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input !== 'string') return NaN;
  const t = input.trim();
  if (!t) return NaN;

  // Limpia: deja solo dígitos, coma, punto y signo.
  const cleaned = t.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return NaN;

  // Determina separador decimal: el último separador encontrado.
  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');
  let normalized: string;
  if (lastDot === -1 && lastComma === -1) {
    normalized = cleaned;
  } else if (lastDot > lastComma) {
    // Punto es decimal, coma es miles → eliminar comas
    normalized = cleaned.replace(/,/g, '');
  } else {
    // Coma es decimal, punto es miles → eliminar puntos, cambiar coma a punto
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function toNum(v: unknown, fallback = 0): number {
  const n = parseLooseNumber(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Extrae el nombre limpio de un valor tipo "EMPRESA (https://...)". */
function stripParenUrl(v: unknown): string {
  const s = toStr(v);
  if (!s) return '';
  // Remueve cualquier paréntesis con URL o (id) al final
  return s
    .replace(/\s*\((?:https?:\/\/|app\.notion|www\.notion)[^)]*\)\s*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

function slugify(v: string, fallback: string): string {
  if (!v) return fallback;
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** LLC puede venir como relation (array de ids), o como rich_text con
 * "NOMBRE (url)" cuando el campo fue exportado/importado vía CSV. */
function resolveEmpresa(row: NormalizedRow): { id: string; name: string } {
  // 1. Si el usuario expone un rollup explícito, usamos ese
  const explicitName = toStr(pickField(row, COL_EMPRESA_NOMBRE));
  if (explicitName) {
    const clean = stripParenUrl(explicitName);
    return { id: slugify(clean, 'empresa'), name: clean };
  }

  // 2. Relation real: array de ids
  const raw = row[COL_LLC[0]];
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    const short = raw[0].replace(/-/g, '').slice(0, 6);
    return { id: raw[0], name: `Empresa ${short}` };
  }

  // 3. Rich text con formato "NOMBRE (url)" (caso CSV importado)
  if (typeof raw === 'string' && raw.trim()) {
    const clean = stripParenUrl(raw);
    return { id: slugify(clean, 'empresa'), name: clean };
  }

  return { id: 'sin-empresa', name: 'Sin empresa' };
}

// ─── Normalizers por bucket ────────────────────────────────────
function buildPolizaCompania(row: NormalizedRow): PolizaCompania {
  const empresa = resolveEmpresa(row);
  const tipo = toStr(pickField(row, COL_TIPO));
  const nombreRaw = toStr(pickField(row, COL_NOMBRE));
  // Cuando el "Nombre" viene vacío, fallback al label legible del tipo
  const nombre = nombreRaw || TIPO_TO_NOMBRE_POLIZA[tipo] || tipo || 'Póliza';
  return {
    id: row.id,
    empresaId: empresa.id,
    empresaName: empresa.name,
    nombre,
    aseguradora: toStr(pickField(row, COL_ASEGURADORA)),
    broker: toStr(pickField(row, COL_BROKER)),
    numero: toStr(pickField(row, COL_NUMERO)),
    vigenciaInicio: toDate(pickField(row, COL_VIGENCIA_INICIO)),
    vigenciaFin: toDate(pickField(row, COL_VIGENCIA_FIN)),
    cobertura: toNum(pickField(row, COL_COBERTURA)),
    payroll: ((): number | null => {
      const v = pickField(row, COL_PAYROLL);
      if (v === null || v === undefined || v === '') return null;
      return toNum(v);
    })(),
    costo: toNum(pickField(row, COL_COSTO)),
  };
}

function buildPolizaVehiculo(row: NormalizedRow): PolizaVehiculo {
  return {
    id: row.id,
    nombre: toStr(pickField(row, COL_NOMBRE)),
    asignacion: toStr(pickField(row, COL_ASIGNACION)),
    vigenciaFin: toDate(pickField(row, COL_VIGENCIA_FIN)),
  };
}

function buildPolizaPropiedad(row: NormalizedRow): PolizaPropiedad {
  return {
    id: row.id,
    nombre: toStr(pickField(row, COL_NOMBRE)),
    vigenciaFin: toDate(pickField(row, COL_VIGENCIA_FIN)),
  };
}

// ─── Fetch real ────────────────────────────────────────────────
async function fetchFromNotion(): Promise<SegurosSnapshot> {
  if (!DB_SEGUROS) {
    throw new Error(
      'Seguros: falta EXPO_PUBLIC_NOTION_DB_SEGUROS en .env',
    );
  }

  const resp = await notionQueryAll({ database_id: DB_SEGUROS });
  const rows = normalizeRows(resp.results);

  const companiaRows: NormalizedRow[] = [];
  const vehiculoRows: NormalizedRow[] = [];
  const propiedadRows: NormalizedRow[] = [];

  for (const r of rows) {
    const tipo = toStr(pickField(r, COL_TIPO));
    const bucket = bucketize(tipo);
    if (bucket === 'compania') companiaRows.push(r);
    else if (bucket === 'vehiculo') vehiculoRows.push(r);
    else if (bucket === 'propiedad') propiedadRows.push(r);
    // null bucket → fila sin Tipo de Seguro, la ignoramos
  }

  // Compañías: agrupar por empresa
  const empresasMap = new Map<string, SeguroEmpresa>();
  for (const r of companiaRows) {
    const p = buildPolizaCompania(r);
    let empresa = empresasMap.get(p.empresaId);
    if (!empresa) {
      empresa = { id: p.empresaId, name: p.empresaName, polizas: [] };
      empresasMap.set(p.empresaId, empresa);
    }
    empresa.polizas.push(p);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    empresas: [...empresasMap.values()],
    vehiculos: vehiculoRows.map(buildPolizaVehiculo),
    propiedades: propiedadRows.map(buildPolizaPropiedad),
    updatedAt: todayIso,
    todayIso,
  };
}

export async function getSegurosSnapshot(): Promise<SegurosSnapshot> {
  return withMock(fetchFromNotion, () => getSegurosMock());
}
