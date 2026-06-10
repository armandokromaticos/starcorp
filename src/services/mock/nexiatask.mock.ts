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
  // ── Administrativo · Responsabilidad "Desarrollo del área comercial" ──
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo del área comercial',
    tarea_id: 'admin-1-t1',
    tarea: 'Estrategia de referidos desde la operación',
    objetivo: 'Aumentar asociados',
    meta: '20 personas',
    estado: 'Aprobada / Cerrada',
    prioridad: 'Alta',
    es_recurrente: false,
    fecha_limite: '2026-05-30',
    completada_en: '2026-05-12',
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento:
      'Se están realizando los primeros pilotos para generar estadísticas; subimos a 2 personas referidas',
    cumplimiento_pct: 100,
    bloqueo: 'Sin planeación por parte del cliente',
    apoyo_requerido: 'Acompañamiento comercial',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo del área comercial',
    tarea_id: 'admin-1-t2',
    tarea: 'Enviar reporte de presupuesto de pauta',
    objetivo: 'Validar presupuesto Q2',
    meta: 'Reporte semanal',
    estado: 'En progreso',
    prioridad: 'Media',
    es_recurrente: true,
    fecha_limite: '2026-05-25',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Avance parcial: enviado el reporte de las primeras dos semanas',
    cumplimiento_pct: 50,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo del área comercial',
    tarea_id: 'admin-1-t3',
    tarea: 'Evaluar viabilidad de seguir desarrollando K',
    objetivo: 'Decisión go/no-go',
    meta: 'Informe técnico',
    estado: 'En progreso',
    prioridad: 'Alta',
    es_recurrente: false,
    fecha_limite: '2026-06-10',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'En análisis técnico; pendiente reunión con producto',
    cumplimiento_pct: 60,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo del área comercial',
    tarea_id: 'admin-1-t4',
    tarea: 'Atacar a los OMNI',
    objetivo: 'Reducir competencia',
    meta: '5 cuentas migradas',
    estado: 'Bloqueada',
    prioridad: 'Baja',
    es_recurrente: false,
    fecha_limite: '2026-07-01',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Avance inicial; a la espera de material comercial',
    cumplimiento_pct: 10,
    bloqueo: 'Falta material comercial',
    apoyo_requerido: 'Diseño',
  },
  // ── Administrativo · Responsabilidad "Gestión de talento" ──
  {
    departamento: 'Departamento Administrativo',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Gestión de talento',
    tarea_id: 'admin-2-t1',
    tarea: 'Onboarding nuevos asociados',
    objetivo: 'Estándar de onboarding',
    meta: 'Proceso documentado',
    estado: 'En progreso',
    prioridad: 'Media',
    es_recurrente: false,
    fecha_limite: '2026-06-15',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Draft v1 de documentación y kits de bienvenida en revisión',
    cumplimiento_pct: 40,
    bloqueo: '',
    apoyo_requerido: '',
  },
  // ── Comercial · Responsabilidad "Desarrollo de cuentas PATRIOT" ──
  {
    departamento: 'Departamento Comercial',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo de cuentas PATRIOT',
    tarea_id: 'com-1-t1',
    tarea: 'Cierre de contrato OMNI Madrid',
    objetivo: 'Firmar contrato',
    meta: '1 cliente',
    estado: 'En progreso',
    prioridad: 'Alta',
    es_recurrente: false,
    fecha_limite: '2026-05-20',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Negociación en fase final, pendiente firma',
    cumplimiento_pct: 80,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Comercial',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Desarrollo de cuentas PATRIOT',
    tarea_id: 'com-1-t2',
    tarea: 'Renovación de cuentas Q2',
    objetivo: 'Retención',
    meta: '90% renovación',
    estado: 'Recurrente',
    prioridad: 'Alta',
    es_recurrente: true,
    fecha_limite: '2026-06-30',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: '3 de 5 cuentas confirmadas para renovación',
    cumplimiento_pct: 60,
    bloqueo: '',
    apoyo_requerido: '',
  },
  // ── Financiero · Responsabilidad "Cierre contable" ──
  {
    departamento: 'Departamento Financiero',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Cierre contable',
    tarea_id: 'fin-1-t1',
    tarea: 'Conciliación bancaria abril',
    objetivo: 'Cierre contable',
    meta: '100% conciliado',
    estado: 'Aprobada / Cerrada',
    prioridad: 'Alta',
    es_recurrente: false,
    fecha_limite: '2026-05-10',
    completada_en: '2026-05-08',
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Cruce con extractos cerrado al 100%',
    cumplimiento_pct: 100,
    bloqueo: '',
    apoyo_requerido: '',
  },
  {
    departamento: 'Departamento Financiero',
    responsable: 'Daniel Zapata',
    responsabilidad: 'Cierre contable',
    tarea_id: 'fin-1-t2',
    tarea: 'Presupuesto operativo Q3',
    objetivo: 'Aprobación junta',
    meta: 'Borrador entregado',
    estado: 'En progreso',
    prioridad: 'Media',
    es_recurrente: false,
    fecha_limite: '2026-06-20',
    completada_en: null,
    razon_no_realizada: null,
    semana: '2026-05-09',
    actualizado: true,
    seguimiento: 'Proyección por centro de costo en curso',
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
 * Agrupa tareas por departamento → "proyecto" usando el campo
 * `responsabilidad` que ahora expone `GET /api/integration/avance`
 * (antes se agrupaba con un heurístico de chunks de 4). Cada
 * responsabilidad distinta se vuelve un proyecto numerado, preservando
 * el orden de aparición dentro del departamento.
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
    .map(([nombre, tareasDelDepto]) => {
      // Agrupar por responsabilidad preservando el orden de aparición.
      const byResp = new Map<string, NexiataskTareaRaw[]>();
      for (const t of tareasDelDepto) {
        const key = t.responsabilidad?.trim() || 'Sin responsabilidad';
        const list = byResp.get(key) ?? [];
        list.push(t);
        byResp.set(key, list);
      }

      const proyectos: NexiataskProyecto[] = Array.from(byResp.entries()).map(
        ([titulo, tareasDeResp], idx) => ({
          id: `${nombre.toLowerCase().replace(/\s+/g, '-')}-p${idx + 1}`,
          numero: idx + 1,
          titulo,
          tareas: tareasDeResp.map(rawToUiTarea),
        }),
      );

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
    responsabilidad: raw.responsabilidad,
    seguimiento: raw.seguimiento,
    estado: raw.estado,
    esRecurrente: raw.es_recurrente,
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
    // /avance ya no trae `resultado`; usamos el narrativo de `seguimiento`.
    resultado: raw.seguimiento,
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
