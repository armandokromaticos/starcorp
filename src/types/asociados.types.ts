/**
 * Tipos del Informe Asociados activos.
 *
 * Fuente: PBI empleadosHotel (vía empleados_detail / RPC get_asociados_snapshot).
 * "Activos" = Retirement Date en blanco. El "cargo" mostrado es el `area` real
 * de cada empleado (campo libre), por lo que el filtro de área es dinámico.
 */

export interface AsociadoEmployee {
  id: string;
  name: string;
  /** Área/posición actual del empleado (campo libre de empleadosHotel). */
  area: string;
  codigoInterno: string;
}

export interface AsociadoClient {
  id: string;
  name: string;
  /** Cuenta padre (Account) — ej. "5TARS", "PATRIOT". null si no aplica. */
  account: string | null;
  color: string;
  employees: AsociadoEmployee[];
}

export interface AsociadosSnapshot {
  clients: AsociadoClient[];
  updatedAt: string;
}
