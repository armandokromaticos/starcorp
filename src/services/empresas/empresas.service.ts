/**
 * Service: Otras compañías
 *
 * Mock-only por ahora. A diferencia de otros servicios NO usamos
 * `withMock`: el proyecto corre con EXPO_PUBLIC_USE_MOCKS=false (backend
 * real para finanzas), pero esta sección aún no tiene backend, así que
 * devolvemos el mock directamente. Cuando exista la fuente real, cambiar
 * estas funciones por la llamada correspondiente.
 */

import {
  getEmpresaDetailMock,
  getEmpresasMock,
} from '@/src/services/mock/empresas.mock';
import type { EmpresaDetail, EmpresaListItem } from '@/src/types/empresas.types';

// Pequeña latencia simulada para que los estados de carga se vean naturales.
function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getEmpresas(): Promise<EmpresaListItem[]> {
  return delay(getEmpresasMock());
}

export function getEmpresaDetail(id: string): Promise<EmpresaDetail | null> {
  return delay(getEmpresaDetailMock(id));
}
