====================================================
  NEXIATASK — API DE INTEGRACIÓN
  Para uso exclusivo del área de Sistemas
====================================================

BASE URL:  https://nexiatask-api.onrender.com/api
API KEY:   nexia_2025_k9mX4pQr7vBjL2wN8sT

Incluir en cada llamado:
  Header:  X-API-Key: nexia_2025_k9mX4pQr7vBjL2wN8sT

====================================================
  ENDPOINTS DISPONIBLES
====================================================

1. SEGUIMIENTO SEMANAL
      GET /integration/seguimiento

   Parámetros opcionales:
   - week_start=YYYY-MM-DD   (semana específica, por defecto: semana actual)
   - include_completed=true  (incluye tareas cerradas y no realizadas)

   Ejemplo:
   GET https://nexiatask-api.onrender.com/api/integration/seguimiento
   GET https://nexiatask-api.onrender.com/api/integration/seguimiento?week_start=2025-05-10
   GET https://nexiatask-api.onrender.com/api/integration/seguimiento?include_completed=true

   Campos que devuelve por tarea:
   - departamento
   - responsable
   - tarea_id
   - tarea
   - descripcion
   - objetivo
   - meta
   - estado
   - prioridad
   - fecha_limite
   - completada_en
   - razon_no_realizada
   - semana
   - actualizado  (true/false)
   - resultado
   - cumplimiento_pct
   - bloqueo
   - apoyo_requerido

2. LISTA DE TAREAS
      GET /integration/tareas

   Parámetros opcionales:
   - status=En progreso
   - responsible_user_id=uuid
   - department_id=uuid

   Ejemplo:
   GET https://nexiatask-api.onrender.com/api/integration/tareas

3. KPIs GLOBALES
      GET /integration/kpis

   Ejemplo:
   GET https://nexiatask-api.onrender.com/api/integration/kpis

====================================================
  EJEMPLO EN PYTHON
====================================================

import requests

API  = "https://nexiatask-api.onrender.com/api/integration"
KEY  = "nexia_2025_k9mX4pQr7vBjL2wN8sT"
HEAD = {"X-API-Key": KEY}

# Seguimiento semana actual

seg = requests.get(f"{API}/seguimiento", headers=HEAD).json()
for t in seg["tareas"]:
    print(t["departamento"], t["responsable"], t["tarea"], t["cumplimiento_pct"])

# Seguimiento semana específica

seg = requests.get(f"{API}/seguimiento",
    params={"week_start": "2025-05-10", "include_completed": True},
    headers=HEAD).json()

# Todas las tareas

tareas = requests.get(f"{API}/tareas", headers=HEAD).json()

# KPIs

kpis = requests.get(f"{API}/kpis", headers=HEAD).json()

====================================================
  EJEMPLO EN JAVASCRIPT / NODE
====================================================

const API  = "https://nexiatask-api.onrender.com/api/integration";
const HEAD = { "X-API-Key": "nexia_2025_k9mX4pQr7vBjL2wN8sT" };

// Seguimiento
const res  = await fetch(`${API}/seguimiento`, { headers: HEAD });
const data = await res.json();
console.log(data.tareas);

// KPIs
const kpis = await fetch(`${API}/kpis`, { headers: HEAD }).then(r => r.json());

====================================================
  NOTAS IMPORTANTES
====================================================

- No se requiere login ni tokens. Solo el header X-API-Key.
- La semana empieza el SÁBADO (formato YYYY-MM-DD).
- Todas las fechas están en UTC (ISO 8601).
- cumplimiento_pct va de 0 a 100.
- Si "actualizado" es false, los campos resultado/bloqueo/
    apoyo_requerido vienen vacíos para esa semana.
- Acceso de solo lectura. No modifica datos.

# Contacto técnico: blue.solutions2025@gmail.com
