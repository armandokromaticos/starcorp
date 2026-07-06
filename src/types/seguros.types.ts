/**
 * Tipos del Informe Seguros.
 *
 * 3 dominios independientes: Compañías (pólizas de cada Realm de QB,
 * tipo General Liability/Umbrella/Worker Compensation), Vehículos y
 * Propiedades. Cada póliza tiene `vigenciaFin` desde donde se deriva
 * su estado (`activa | por_vencer | vencida`).
 */

export type PolizaStatus = 'activa' | 'por_vencer' | 'vencida';

/**
 * Estado declarado en la columna "Estado" de Notion (ACTIVA / VENCIDA /
 * CANCELADA). Independiente del estado derivado por fecha: sólo lo usamos
 * para sacar las CANCELADA de la vista principal y dejarlas en el
 * histórico. `null` = columna vacía o valor no reconocido.
 */
export type PolizaEstadoNotion = 'activa' | 'vencida' | 'cancelada' | null;

export function isCancelada(p: { estado?: PolizaEstadoNotion }): boolean {
  return p.estado === 'cancelada';
}

/**
 * Opciones del filtro por chips de estado de póliza (Vigente / Por vencer /
 * Vencido). Compartido por el detalle de compañía y el histórico para
 * unificar el diseño. Orden = orden de los chips.
 */
export const POLIZA_STATUS_FILTERS: readonly {
  key: PolizaStatus;
  label: string;
}[] = [
  { key: 'activa', label: 'Vigente' },
  { key: 'por_vencer', label: 'Por vencer' },
  { key: 'vencida', label: 'Vencido' },
];

export interface PolizaCompania {
  id: string;
  empresaId: string;
  empresaName: string;
  nombre: string;
  aseguradora: string;
  broker: string;
  numero: string;
  vigenciaInicio: string;
  vigenciaFin: string;
  cobertura: number;
  payroll: number | null;
  costo: number;
  estado?: PolizaEstadoNotion;
}

export interface PolizaVehiculo {
  id: string;
  nombre: string;
  asignacion: string;
  vigenciaFin: string;
  estado?: PolizaEstadoNotion;
}

export interface PolizaPropiedad {
  id: string;
  nombre: string;
  vigenciaFin: string;
  estado?: PolizaEstadoNotion;
}

export interface SeguroEmpresa {
  id: string;
  name: string;
  polizas: PolizaCompania[];
}

export interface SegurosSnapshot {
  empresas: SeguroEmpresa[];
  vehiculos: PolizaVehiculo[];
  propiedades: PolizaPropiedad[];
  updatedAt: string;
  todayIso: string;
}

/** Umbral de "por vencer" en días. */
export const POR_VENCER_DAYS = 60;

export function diffInDays(targetIso: string, todayIso: string): number {
  const t = new Date(targetIso).getTime();
  const n = new Date(todayIso).getTime();
  return Math.round((t - n) / 86400000);
}

export function polizaStatus(
  vigenciaFin: string,
  todayIso: string,
): PolizaStatus {
  const diff = diffInDays(vigenciaFin, todayIso);
  if (diff < 0) return 'vencida';
  if (diff <= POR_VENCER_DAYS) return 'por_vencer';
  return 'activa';
}

export function formatVigenciaDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
