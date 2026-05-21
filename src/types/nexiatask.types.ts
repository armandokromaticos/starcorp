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

export type NexiataskEstado =
  | 'Activa'
  | 'En progreso'
  | 'Completado'
  | 'No realizada'
  | 'Cerrada';

export type NexiataskPrioridad = 'Alta' | 'Media' | 'Baja';

export interface NexiataskTareaRaw {
  departamento: string;
  responsable: string;
  tarea_id: string;
  tarea: string;
  descripcion: string;
  objetivo: string;
  meta: string;
  estado: NexiataskEstado | string;
  prioridad: NexiataskPrioridad | string;
  /** ISO con TZ ("2026-05-19T01:47:52.124904+00:00") o "YYYY-MM-DD" */
  fecha_limite: string;
  /** API devuelve `""` cuando no aplica, no `null` */
  completada_en: string | null;
  razon_no_realizada: string | null;
  /** Sábado de la semana — ISO con TZ ("2026-05-16T00:00:00+00:00") o "YYYY-MM-DD" */
  semana: string;
  actualizado: boolean;
  resultado: string;
  /** 0-100; `null` cuando aún no se ha medido */
  cumplimiento_pct: number | null;
  bloqueo: string;
  apoyo_requerido: string;
}

export interface NexiataskSeguimientoResponse {
  tareas: NexiataskTareaRaw[];
}

// ─── UI-shaped tree (agrupado client-side) ──────────────────────

export interface NexiataskTarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: NexiataskEstado | string;
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
