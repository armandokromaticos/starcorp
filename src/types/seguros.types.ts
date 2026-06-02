/**
 * Tipos del Informe Seguros.
 *
 * 3 dominios independientes: Compañías (pólizas de cada Realm de QB,
 * tipo General Liability/Umbrella/Worker Compensation), Vehículos y
 * Propiedades. Cada póliza tiene `vigenciaFin` desde donde se deriva
 * su estado (`activa | por_vencer | vencida`).
 */

export type PolizaStatus = 'activa' | 'por_vencer' | 'vencida';

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
}

export interface PolizaVehiculo {
  id: string;
  nombre: string;
  asignacion: string;
  vigenciaFin: string;
}

export interface PolizaPropiedad {
  id: string;
  nombre: string;
  vigenciaFin: string;
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
