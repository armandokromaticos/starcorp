/**
 * Service: VAG
 *
 * Mock-only por ahora (mismo criterio que tuvo empresas.service antes de
 * conectar BBM): la sección corre con backend real en el resto de la app,
 * pero VAG aún no tiene fuente. Cuando exista, reemplazar estas funciones
 * por la llamada correspondiente.
 */

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

// Pequeña latencia simulada para que los estados de carga se vean naturales.
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getVagResumen(): Promise<VagResumen> {
  return delay(getVagResumenMock());
}

export function getVagActivos(): Promise<VagActivo[]> {
  return delay(getVagActivosMock());
}

export function getVagMovimientos(): Promise<VagMovimiento[]> {
  return delay(getVagMovimientosMock());
}

export function getVagCuentas(tipo: VagCuentaTipo): Promise<VagCuenta[]> {
  return delay(getVagCuentasMock(tipo));
}
