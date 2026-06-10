/**
 * NexiaTask API Types
 *
 * Tipos crudos de la API externa NexiaTask (https://nexiatask-api.onrender.com)
 * + tipos UI agrupados (departamento → proyecto → tareas) construidos
 * client-side hasta que backend exponga el concepto de "proyecto/iniciativa
 * padre" (ver docs/nexiatask-backend-pendientes.md).
 */

import type React from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

export type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

// ─── Raw API shape (1:1 con el doc de integración) ──────────────

/**
 * Estados válidos de `GET /api/integration/avance` (doc 2026-06).
 * `include_completed=true` agrega "Aprobada / Cerrada" y "No realizada".
 */
export type NexiataskEstado =
  | 'Pendiente'
  | 'En progreso'
  | 'Recurrente'
  | 'Bloqueada'
  | 'En espera de cliente'
  | 'En espera de usuario/Presidencia'
  | 'Lista para revisión'
  | 'Devuelta / Requiere ajustes'
  | 'Aprobada / Cerrada'
  | 'No realizada';

export type NexiataskPrioridad = 'Alta' | 'Media' | 'Baja';

/**
 * Una tarea dentro de `GET /api/integration/avance`. El endpoint
 * `/seguimiento` fue reemplazado por `/avance`: ya no trae `descripcion`
 * ni `resultado`; el narrativo semanal vive en `seguimiento`, y
 * `responsabilidad` expone por fin la iniciativa padre (antes la
 * agrupábamos con un heurístico — ver docs/nexiatask-backend-pendientes.md).
 */
export interface NexiataskTareaRaw {
  departamento: string;
  responsable: string;
  /** Iniciativa / responsabilidad padre ("Desarrollo de cuentas PATRIOT") */
  responsabilidad: string;
  tarea_id: string;
  tarea: string;
  objetivo: string;
  meta: string;
  estado: NexiataskEstado | string;
  prioridad: NexiataskPrioridad | string;
  es_recurrente: boolean;
  /** ISO con TZ ("2026-05-19T01:47:52.124904+00:00"), "YYYY-MM-DD" o "" */
  fecha_limite: string;
  /** API devuelve `""` cuando no aplica, no `null` */
  completada_en: string | null;
  razon_no_realizada: string | null;
  /** Sábado de la semana — ISO con TZ ("2026-05-16T00:00:00+00:00") o "YYYY-MM-DD" */
  semana: string;
  actualizado: boolean;
  /** Narrativo del avance de la semana ("Esta semana se realizaron 3 visitas…") */
  seguimiento: string;
  /** 0-100; `null` cuando aún no se ha medido */
  cumplimiento_pct: number | null;
  bloqueo: string;
  apoyo_requerido: string;
}

/** Respuesta de `GET /api/integration/avance` */
export interface NexiataskAvanceResponse {
  /** Etiqueta legible: "30/05 – 05/06/2026" */
  semana: string;
  /** Sábado de inicio en ISO ("2026-05-30T00:00:00+00:00") */
  week_start: string;
  total_tareas: number;
  actualizadas: number;
  sin_actualizar: number;
  tareas: NexiataskTareaRaw[];
}

/** Respuesta de `GET /api/integration/kpis` */
export interface NexiataskKpisResponse {
  total_tareas: number;
  tareas_activas: number;
  tareas_cerradas: number;
  tareas_vencidas: number;
  tareas_bloqueadas: number;
  tareas_recurrentes: number;
  /** Tasa de completado (%) */
  tasa_completado: number;
  por_estado: Record<string, number>;
  por_prioridad: Record<string, number>;
}

// ─── UI-shaped tree (agrupado client-side) ──────────────────────

export interface NexiataskTarea {
  id: string;
  titulo: string;
  /** Iniciativa / responsabilidad padre (de `raw.responsabilidad`) */
  responsabilidad: string;
  /** Narrativo del avance de la semana (de `raw.seguimiento`) */
  seguimiento: string;
  estado: NexiataskEstado | string;
  esRecurrente: boolean;
  /** 0-100; ya coalescido (null → 0) en el adapter */
  cumplimientoPct: number;
  semanaLabel: string;
  fechaMes: string;
  fechaDia: string;
  /** Fecha límite formateada para UI ("19 May 2026") o "" si no aplica */
  fechaLimiteLabel: string;
  /** Raw para alimentar el detalle sin re-fetch */
  raw: NexiataskTareaRaw;
}

export interface NexiataskProyecto {
  id: string;
  numero: number;
  titulo: string;
  tareas: NexiataskTarea[];
}

export interface NexiataskDepartamento {
  id: string;
  nombre: string;
  responsable: string;
  icon: MaterialIconName;
  proyectos: NexiataskProyecto[];
}

export interface NexiataskResponsibilities {
  departamentos: NexiataskDepartamento[];
}

// ─── Detalle + avances ──────────────────────────────────────────

export interface NexiataskAvance {
  id: string;
  semana: string;
  semanaLabel: string;
  fechaMes: string;
  fechaDia: string;
  descripcion: string;
  cumplimientoPct: number;
}

export interface NexiataskTareaDetalle extends NexiataskTarea {
  departamentoId: string;
  departamentoNombre: string;
  objetivo: string;
  meta: string;
  resultado: string;
  bloqueo: string;
  apoyoRequerido: string;
  fechaLimite: string;
  avances: NexiataskAvance[];
}
