/**
 * NexiaTask Mock Data
 *
 * Datos en el shape de la API real (NexiataskTareaRaw) + helpers que
 * arman el árbol UI agrupado. Cuando backend resuelva el concepto de
 * "proyecto padre" y exponga el endpoint de histórico, solo se cambia
 * el adapter — los tipos UI no se mueven.
 */

import type {
  NexiataskTareaRaw,
  NexiataskResponsibilities,
  NexiataskTareaDetalle,
  NexiataskDepartamento,
  NexiataskProyecto,
  NexiataskTarea,
  NexiataskAvance,
  MaterialIconName,
} from '@/src/types/nexiatask.types';

// ─── Raw tasks (shape API) ──────────────────────────────────────

export const mockNexiataskTareasRaw: NexiataskTareaRaw[] = [
  // ── Administrativo · Proyecto "Desarrollo del área comercial" ──
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    tarea_id: 'admin-1-t1',
    tarea: 'Estrategia de referidos desde la operación',
    descripcion:
      'Se están realizando los primeros pilotos para generar estadísticas',
    objetivo: 'Aumentar asociados',
    meta: '20 personas',
    estado: 'Completado',
    prioridad: 'Alta',
    fecha_limite: '2026-05-30',
    completada_en: '2026-05-12',
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: '2 personas',
    cumplimiento_pct: 100,
    bloqueo: 'Sin planeación por parte del cliente',
    apoyo_requerido: 'Acompañamiento comercial',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    tarea_id: 'admin-1-t2',
    tarea: 'Enviar reporte de presupuesto de pauta',
    descripcion:
      'Se están realizando los primeros pilotos para generar estadísticas',
    objetivo: 'Validar presupuesto Q2',
    meta: 'Reporte semanal',
    estado: 'Activa',
    prioridad: 'Media',
    fecha_limite: '2026-05-25',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'Avance parcial',
    cumplimiento_pct: 50,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    tarea_id: 'admin-1-t3',
    tarea: 'Evaluar viabilidad de seguir desarrollando K',
    descripcion:
      'Se están realizando los primeros pilotos para generar estadísticas',
    objetivo: 'Decisión go/no-go',
    meta: 'Informe técnico',
    estado: 'Activa',
    prioridad: 'Alta',
    fecha_limite: '2026-06-10',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'En análisis',
    cumplimiento_pct: 60,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    tarea_id: 'admin-1-t4',
    tarea: 'Atacar a los OMNI',
    descripcion:
      'Se están realizando los primeros pilotos para generar estadísticas',
    objetivo: 'Reducir competencia',
    meta: '5 cuentas migradas',
    estado: 'Activa',
    prioridad: 'Baja',
    fecha_limite: '2026-07-01',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'Inicial',
    cumplimiento_pct: 10,
    bloqueo: 'Falta material comercial',
    apoyo_requerido: 'Diseño',
  },
  // ── Administrativo · Proyecto 2 ──
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    tarea_id: 'admin-2-t1',
    tarea: 'Onboarding nuevos asociados',
    descripcion: 'Documentación y kits de bienvenida',
    objetivo: 'Estándar de onboarding',
    meta: 'Proceso documentado',
    estado: 'Activa',
    prioridad: 'Media',
    fecha_limite: '2026-06-15',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'Draft v1',
    cumplimiento_pct: 40,
    bloqueo: '',
    apoyo_requerido: '',
  },
  // ── Comercial ──
  {
    departamento: 'Departamento Comercial',
    responsable: 'Daniel Zapata',
    tarea_id: 'com-1-t1',
    tarea: 'Cierre de contrato OMNI Madrid',
    descripcion: 'Negociación en fase final',
    objetivo: 'Firmar contrato',
    meta: '1 cliente',
    estado: 'Activa',
    prioridad: 'Alta',
    fecha_limite: '2026-05-20',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'Pendiente firma',
    cumplimiento_pct: 80,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Comercial',
    responsable: 'Daniel Zapata',
    tarea_id: 'com-1-t2',
    tarea: 'Renovación de cuentas Q2',
    descripcion: '5 cuentas en revisión',
    objetivo: 'Retención',
    meta: '90% renovación',
    estado: 'Activa',
    prioridad: 'Alta',
    fecha_limite: '2026-06-30',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: '3 de 5 confirmadas',
    cumplimiento_pct: 60,
    bloqueo: '',
    apoyo_requerido: '',
  },
  // ── Financiero ──
  {
    departamento: 'Departamento Financiero',
    responsable: 'Daniel Zapata',
    tarea_id: 'fin-1-t1',
    tarea: 'Conciliación bancaria abril',
    descripcion: 'Cruce con extractos',
    objetivo: 'Cierre contable',
    meta: '100% conciliado',
    estado: 'Completado',
    prioridad: 'Alta',
    fecha_limite: '2026-05-10',
    completada_en: '2026-05-08',
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'Cerrado',
    cumplimiento_pct: 100,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Financiero',
    responsable: 'Daniel Zapata',
    tarea_id: 'fin-1-t2',
    tarea: 'Presupuesto operativo Q3',
    descripcion: 'Proyección por centro de costo',
    objetivo: 'Aprobación junta',
    meta: 'Borrador entregado',
    estado: 'Activa',
    prioridad: 'Media',
    fecha_limite: '2026-06-20',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    resultado: 'En curso',
    cumplimiento_pct: 30,
    bloqueo: '',
    apoyo_requerido: '',
  },
];

// ─── Avances históricos (mock — backend pendiente) ──────────────

const mockAvancesByTaskId: Record<string, NexiataskAvance[]> = {
  'admin-1-t1': [
    {
      id: 'av-1-1',
      semana: '2026-02-09',
      semanaLabel: 'Semana Febrero 09-13',
      fechaMes: 'FEB',
      fechaDia: '02',
      descripcion: '—',
      cumplimientoPct: 60,
    },
    {
      id: 'av-1-2',
      semana: '2026-02-02',
      semanaLabel: 'Semana Febrero 02-06',
      fechaMes: 'FEB',
      fechaDia: '02',
      descripcion:
        'Se presentaron las primeras estadísticas al cliente y subimos a 4 personas',
      cumplimientoPct: 40,
    },
    {
      id: 'av-1-3',
      semana: '2026-01-26',
      semanaLabel: 'Semana Enero 26 - 30',
      fechaMes: 'ENE',
      fechaDia: '01',
      descripcion:
        'Se están realizando los primeros pilotos para generar estadísticas',
      cumplimientoPct: 20,
    },
  ],
};

// ─── Grouping logic (heurístico — backend pendiente) ────────────

const DEPARTMENT_ICONS: Record<string, MaterialIconName> = {
  'Departamento Administrativo': 'work-outline',
  'Departamento Comercial': 'campaign',
  'Departamento Financiero': 'account-balance',
};

const DEPARTMENT_ORDER = [
  'Departamento Administrativo',
  'Departamento Comercial',
  'Departamento Financiero',
];

/**
 * HEURÍSTICA TEMPORAL: agrupa tareas por departamento → "proyecto"
 * (hoy un único proyecto por depto llamado "Desarrollo del área comercial"
 * como en el mockup). Cuando backend exponga `proyecto_id` / `proyecto_titulo`,
 * reemplazar por agrupación real.
 */
export function groupTareasIntoResponsibilities(
  tareas: NexiataskTareaRaw[],
): NexiataskResponsibilities {
  const byDepto = new Map<string, NexiataskTareaRaw[]>();
  for (const t of tareas) {
    const list = byDepto.get(t.departamento) ?? [];
    list.push(t);
    byDepto.set(t.departamento, list);
  }

  const departamentos: NexiataskDepartamento[] = Array.from(byDepto.entries())
    .sort(([a], [b]) => {
      const ia = DEPARTMENT_ORDER.indexOf(a);
      const ib = DEPARTMENT_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([nombre, tareasDelDepto], idx) => {
      // HACK: hasta tener proyecto_id real, separamos en chunks
      // de máximo 4 tareas para emular "1. … (4 tareas)" del mockup.
      const proyectos: NexiataskProyecto[] = [];
      const chunkSize = 4;
      for (let i = 0; i < tareasDelDepto.length; i += chunkSize) {
        const slice = tareasDelDepto.slice(i, i + chunkSize);
        proyectos.push({
          id: `${nombre}-p${Math.floor(i / chunkSize) + 1}`,
          numero: Math.floor(i / chunkSize) + 1,
          titulo: 'Desarrollo del área comercial',
          tareas: slice.map(rawToUiTarea),
        });
      }
      return {
        id: nombre.toLowerCase().replace(/\s+/g, '-'),
        nombre,
        responsable: tareasDelDepto[0]?.responsable ?? 'Sin asignar',
        icon: DEPARTMENT_ICONS[nombre] ?? 'work-outline',
        proyectos,
      };
    });

  return { departamentos };
}

function rawToUiTarea(raw: NexiataskTareaRaw): NexiataskTarea {
  const { mes, dia } = parseSemanaDate(raw.semana);
  return {
    id: raw.tarea_id,
    titulo: raw.tarea,
    descripcion: raw.descripcion,
    estado: raw.estado,
    cumplimientoPct: raw.cumplimiento_pct ?? 0,
    semanaLabel: formatSemanaLabel(raw.semana),
    fechaMes: mes,
    fechaDia: dia,
    fechaLimiteLabel: formatFechaLimite(raw.fecha_limite),
    raw,
  };
}

/**
 * Construye el detalle de una tarea + sus avances históricos.
 * El histórico hoy viene del mock (backend pendiente).
 */
export function getNexiataskTareaDetalle(
  tareaId: string,
): NexiataskTareaDetalle | null {
  const raw = mockNexiataskTareasRaw.find((t) => t.tarea_id === tareaId);
  if (!raw) return null;

  const ui = rawToUiTarea(raw);
  const tree = groupTareasIntoResponsibilities(mockNexiataskTareasRaw);
  const depto = tree.departamentos.find((d) => d.nombre === raw.departamento);

  return {
    ...ui,
    departamentoId: depto?.id ?? '',
    departamentoNombre: raw.departamento || 'Sin Departamento',
    objetivo: raw.objetivo,
    meta: raw.meta,
    resultado: raw.resultado,
    bloqueo: raw.bloqueo,
    apoyoRequerido: raw.apoyo_requerido,
    fechaLimite: raw.fecha_limite,
    avances: mockAvancesByTaskId[tareaId] ?? [],
  };
}

// ─── Date helpers ───────────────────────────────────────────────

const MES_ABBR = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// La API real manda ISO con TZ ("2026-05-16T00:00:00+00:00") y el mock
// histórico usa solo "YYYY-MM-DD". Aceptamos ambos para no romper en el
// switch entre EXPO_PUBLIC_USE_MOCKS=true/false.
function toDate(iso: string): Date | null {
  if (!iso) return null;
  const hasTime = /T\d/.test(iso);
  const d = new Date(hasTime ? iso : iso + 'T00:00:00Z');
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseSemanaDate(iso: string): { mes: string; dia: string } {
  const d = toDate(iso);
  if (!d) return { mes: '—', dia: '—' };
  return {
    mes: MES_ABBR[d.getUTCMonth()] ?? '—',
    dia: String(d.getUTCDate()).padStart(2, '0'),
  };
}

function formatSemanaLabel(iso: string): string {
  const start = toDate(iso);
  if (!start) return 'Semana —';
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 4);
  const mesIdx = start.getUTCMonth();
  return `Semana ${MES_FULL[mesIdx]} ${String(start.getUTCDate()).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;
}

function formatFechaLimite(iso: string): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MES_ABBR[d.getUTCMonth()] ?? '—'} ${d.getUTCFullYear()}`;
}
