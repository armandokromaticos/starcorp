/**
 * NexiaTask Service
 *
 * Wrapper sobre la API externa NexiaTask. Cuando EXPO_PUBLIC_USE_MOCKS=true
 * (default) retorna mocks. En false invoca la Edge Function
 * `nexiatask-proxy` con el JWT del usuario, que a su vez llama al upstream
 * inyectando la API key desde Deno.env.
 *
 * ⚠️ NUNCA llamar directo a nexiatask-api.onrender.com desde el cliente —
 * la API key quedaría en el bundle.
 */

import { supabase } from '@/src/config/supabase';
import { withMock } from '@/src/services/mock/mock-adapter';
import {
  mockNexiataskTareasRaw,
  groupTareasIntoResponsibilities,
  getNexiataskTareaDetalle,
} from '@/src/services/mock/nexiatask.mock';
import type {
  NexiataskResponsibilities,
  NexiataskTareaDetalle,
  NexiataskTareaRaw,
  NexiataskAvanceResponse,
} from '@/src/types/nexiatask.types';

type ProxyEndpoint = 'avance' | 'tareas' | 'kpis';

async function invokeProxy<T>(
  endpoint: ProxyEndpoint,
  params?: Record<string, string | number | boolean>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(
    'nexiatask-proxy',
    { body: { endpoint, params } },
  );
  if (error) {
    throw new Error(`[nexiatask-proxy] ${endpoint}: ${error.message}`);
  }
  if (data == null) {
    throw new Error(`[nexiatask-proxy] ${endpoint}: empty response`);
  }
  return data;
}

// ─── Responsabilidades (lista) ──────────────────────────────────

export async function fetchResponsibilities(): Promise<NexiataskResponsibilities> {
  return withMock(
    async () => {
      // /avance devuelve las tareas de la semana actual con todos los
      // campos (responsabilidad/objetivo/meta/seguimiento/bloqueo/etc).
      // Lo preferimos sobre /tareas para tener un solo source-of-truth.
      const resp = await invokeProxy<NexiataskAvanceResponse>('avance', {
        include_completed: true,
      });
      return groupTareasIntoResponsibilities(resp.tareas ?? []);
    },
    () => groupTareasIntoResponsibilities(mockNexiataskTareasRaw),
  );
}

// ─── Detalle de una tarea ───────────────────────────────────────

export async function fetchTareaDetalle(
  tareaId: string,
): Promise<NexiataskTareaDetalle | null> {
  return withMock(
    async () => {
      // La API no expone GET por tarea_id, así que pedimos /avance
      // y filtramos client-side. Cuando backend agregue
      // /tareas/{id}/historico, reemplazar por una sola llamada.
      const resp = await invokeProxy<NexiataskAvanceResponse>('avance', {
        include_completed: true,
      });
      const raw = (resp.tareas ?? []).find(
        (t: NexiataskTareaRaw) => t.tarea_id === tareaId,
      );
      if (!raw) return null;

      // Reusamos el armador del mock para obtener el shape UI ya parseado
      // (fechas, cumplimientoPct coalescido, etc.).
      const tree = groupTareasIntoResponsibilities(resp.tareas ?? []);
      const depto = tree.departamentos.find(
        (d) => d.nombre === raw.departamento,
      );
      const ui = depto?.proyectos
        .flatMap((p) => p.tareas)
        .find((t) => t.id === tareaId);
      if (!ui) return null;

      return {
        ...ui,
        departamentoId: depto?.id ?? '',
        departamentoNombre: raw.departamento || 'Sin Departamento',
        objetivo: raw.objetivo,
        meta: raw.meta,
        // /avance ya no trae `resultado`; el resultado de la semana es el
        // mismo narrativo de `seguimiento`.
        resultado: raw.seguimiento,
        bloqueo: raw.bloqueo,
        apoyoRequerido: raw.apoyo_requerido,
        fechaLimite: raw.fecha_limite,
        avances: [], // backend pendiente: /tareas/{id}/historico
      };
    },
    () => getNexiataskTareaDetalle(tareaId),
  );
}
