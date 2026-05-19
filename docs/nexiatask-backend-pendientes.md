# NexiaTask — Pendientes con equipo backend

Documento para alinear con el equipo de NexiaTask (contacto: blue.solutions2025@gmail.com)
sobre cambios necesarios en la API antes de pasar de mocks a integración real
en la app de Starcorp.

Estado actual (frontend):
- Pantallas `/(tabs)/reportes` y `/(tabs)/reportes/[taskId]` ya maquetadas
  usando datos mock con el **shape exacto** de la API documentada (`NexiataskTareaRaw`).
- Hooks (`useNexiataskResponsibilities`, `useNexiataskTarea`) listos —
  consumen `src/services/nexiatask.service.ts` que hoy retorna mocks
  vía `withMock`.
- Cuando los 4 puntos de abajo se resuelvan, solo hay que implementar
  la Edge Function y cambiar `EXPO_PUBLIC_USE_MOCKS=false`.

---

## 1. Concepto de "Proyecto / Iniciativa padre" — **bloqueante**

La UI agrupa tareas en proyectos numerados:

```
1. Desarrollo del área comercial — 4 tareas ▼
   ├─ Estrategia de referidos desde la operación
   ├─ Enviar reporte de presupuesto de pauta
   ├─ Evaluar viabilidad de seguir desarrollando K
   └─ Atacar a los OMNI
2. Desarrollo del área comercial — 4 Tareas ▼
3. …
```

La API documentada (`GET /integration/tareas`, `GET /integration/seguimiento`)
solo expone `departamento`, `tarea_id`, `tarea` — **no hay campo de proyecto/iniciativa
padre**, así que hoy el frontend agrupa con un heurístico temporal (chunks de 4
tareas por departamento) que **no refleja la realidad de negocio**.

**Solicitud:** agregar a cada tarea los campos:

```jsonc
{
  "proyecto_id": "uuid",
  "proyecto_titulo": "Desarrollo del área comercial",
  "proyecto_numero": 1
}
```

O bien exponer un endpoint nuevo `GET /integration/proyectos` que retorne la
jerarquía completa `proyecto → tareas[]`.

---

## 2. Histórico de avances por tarea — **bloqueante para Image #2**

La pantalla de detalle (`/reportes/[taskId]`) tiene una sección **"Avances"**
que muestra N semanas previas de la misma tarea:

```
FEB 02 — Semana Febrero 09-13 — "—"
FEB 02 — Semana Febrero 02-06 — "Se presentaron las primeras estadísticas…"
ENE 01 — Semana Enero 26 - 30 — "Se están realizando los primeros pilotos…"
```

La API actual solo devuelve **una semana por request** (`week_start`). Hacer
N requests paralelos desde el cliente es viable pero:
- La API está en Render → cold start de hasta 30s en la primera llamada.
- Cada semana = una llamada extra → 5 semanas = 5 round-trips.
- No hay paginación ni endpoint dedicado.

**Solicitud:** un endpoint del tipo:

```
GET /integration/tareas/{tarea_id}/historico?weeks=8
```

Que retorne un array de semanas con los campos: `semana`, `actualizado`,
`resultado`, `descripcion`, `cumplimiento_pct`, `bloqueo`, `apoyo_requerido`.

Mientras tanto el frontend muestra histórico mock + empty state cuando viene vacío.

---

## 3. Enums de `estado` y `prioridad`

La doc menciona los campos pero no lista los valores posibles. La UI ya tiene
componentes con colores semánticos (`AtProgressPill`, badge "Activa"/"Completado",
gradiente verde/naranja/rojo) que necesitan saber qué valores esperar para
mapearlos correctamente.

**Solicitud:** confirmar los enumerados, por ejemplo:

```
estado:     "Activa" | "En progreso" | "Completado" | "No realizada" | "Cerrada"
prioridad:  "Alta" | "Media" | "Baja"
```

Hoy el frontend hace match insensitivo a `/complet/i` para detectar tareas
terminadas — frágil si llegan valores como "Hecho", "Done", etc.

---

## 4. Seguridad: API key no debe ir al cliente — **importante**

La API hoy se autentica con un header estático:

```
X-API-Key: nexia_2025_k9mX4pQr7vBjL2wN8sT
```

Esta key **no puede vivir en el bundle de la app móvil** (cualquiera con el APK
podría extraerla y consumir la API ilimitadamente). Por convención de este
proyecto, las APIs externas se proxean a través de Edge Functions de Supabase
que verifican el JWT del usuario.

**Plan de implementación (lado Starcorp):**

```
app/(tabs)/reportes/*  ──► useNexiataskResponsibilities ──►
   nexiatask.service.ts ──► supabase.functions.invoke('nexiatask-proxy')
                                       │
                                       ▼
                            supabase/functions/nexiatask-proxy/
                            - valida JWT del usuario
                            - inyecta X-API-Key desde Deno.env (secret)
                            - allowlist: ['seguimiento', 'tareas', 'kpis',
                                          'tareas/{id}/historico']
                            - fetch a nexiatask-api.onrender.com
                            - retorna response al cliente
```

**Solicitud al equipo de NexiaTask (opcional pero recomendado):** considerar
rotar la API key periódicamente o moverse a autenticación con tokens de
servicio scoped (un token por tenant/cliente integrador), de manera que si
una key se compromete no se ven afectados todos los consumidores.

---

## 5. Detalles menores

- **Formato de `semana`:** confirmar que es siempre el sábado en formato `YYYY-MM-DD`
  en UTC. Frontend hace `new Date(semana + 'T00:00:00Z')`; si llega con timezone
  diferente cambian los días mostrados.
- **`actualizado: false`:** el doc dice que cuando es false, los campos
  `resultado`/`bloqueo`/`apoyo_requerido` vienen vacíos. Confirmar si llegan como
  `""` o `null` para ajustar el render del empty state ("—").
- **Paginación:** `GET /integration/tareas` retorna todas las tareas. ¿Hay límite?
  ¿Filtros server-side por fecha? Si crecen mucho, conviene cursor pagination.

---

## Checklist para destrabar la integración real

- [ ] Backend agrega `proyecto_id` / `proyecto_titulo` / `proyecto_numero` a `/tareas`
- [ ] Backend expone `GET /integration/tareas/{id}/historico`
- [ ] Backend documenta enums de `estado` y `prioridad`
- [x] Starcorp implementa `supabase/functions/nexiatask-proxy/index.ts` (deployada 2026-05-18, version 1, ACTIVE)
- [ ] Starcorp setea el secret: `supabase secrets set NEXIATASK_API_KEY=nexia_2025_k9mX4pQr7vBjL2wN8sT`
- [ ] Starcorp setea `EXPO_PUBLIC_USE_MOCKS=false` en `.env` y prueba en staging

---

**Última actualización:** 2026-05-18
**Owner frontend:** Daniel Zapata / Kromaticos
**Owner backend:** blue.solutions2025@gmail.com
