/**
 * VAG — tipos
 *
 * La compañía VAG (sección "Otras compañías") tiene su propio hub con 4
 * vistas: Activos, Movimientos, Cuentas por cobrar y Cuentas por pagar.
 * Datos mock por ahora (ver `src/services/mock/vag.mock.ts`).
 */

/** Métrica de una card del hub. */
export interface VagMetric {
  total: number;
  deltaPct: number;
}

/** Resumen del hub (4 cards). */
export interface VagResumen {
  activos: VagMetric;
  movimientos: VagMetric;
  cuentasCobrar: VagMetric;
  cuentasPagar: VagMetric;
}

/** Item de un grupo de "Movimientos consolidados" de un activo. */
export interface VagActivoGrupoItem {
  id: string;
  nombre: string;
  monto: number;
  /** Movimiento al que navega la flecha (vista Movimientos con foco). */
  movimientoId?: string;
}

/** Grupo de movimientos consolidados (Activos / Administrativos / Financieros). */
export interface VagActivoGrupo {
  id: string;
  titulo: string;
  subpartida: string;
  /** Monto de la subpartida; opcional (el mockup solo lo muestra en algunos grupos). */
  monto?: number;
  items: VagActivoGrupoItem[];
}

/** Un activo de VAG (tarjeta expandible de la vista Activos). */
export interface VagActivo {
  id: string;
  nombre: string;
  tipo: string;
  fechaAdquisicion: string;
  valorAdquisicion: number;
  valorEstimado: number;
  valorContable: number;
  avaluoCatastral: number;
  valorPredial: number;
  valorSeguro: number;
  vigencia: string;
  aseguradora: string;
  ciudad: string;
  direccion: string | null;
  numeroMatricula: string;
  fichaCatastral: { numero: string };
  gruposMovimientos: VagActivoGrupo[];
}

/** Un movimiento (fila expandible de la vista Movimientos). */
export interface VagMovimiento {
  id: string;
  nombre: string;
  tipo: string;
  /** ISO yyyy-mm-dd. */
  fecha: string;
  valor: number;
  subpartida: string;
  tercero: string;
  observaciones: string;
}

/** Movimiento resumido dentro de una cuenta por cobrar/pagar. */
export interface VagCuentaMovimiento {
  id: string;
  tipo: string;
  monto: number;
  movimientoId?: string;
}

/** Una cuenta por cobrar o por pagar (fila expandible). */
export interface VagCuenta {
  id: string;
  nombre: string;
  saldo: number;
  activo: string;
  direccion: string;
  /** Solo cuentas por pagar. */
  servicio?: string;
  movimientos: VagCuentaMovimiento[];
}

export type VagCuentaTipo = 'cobrar' | 'pagar';
