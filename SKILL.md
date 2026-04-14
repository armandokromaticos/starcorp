---
name: starcorp
description: Suite de gestión empresarial para integrar Power BI, QuickBooks y Notion mediante React Native y Supabase.
---

# starcorp

Este skill instruye al agente sobre la arquitectura de seguridad, el flujo de datos entre microservicios y los estándares de UI para el ecosistema Starcorp.

## When to use

Úsalo cuando necesites:
- Crear pantallas en React Native que consuman datos externos.
- Configurar flujos de autenticación OAuth 2.0.
- Escribir Supabase Edge Functions para conectar con QuickBooks, Notion o Power BI.
- Diseñar interfaces móviles con NativeWind siguiendo el sistema de diseño corporativo.

## Instructions

1. **Prioridad de Seguridad (Middleware):**
   - No permitas que el cliente (App) acceda directamente a las APIs de QuickBooks o Power BI.
   - Genera siempre una `Edge Function` en Supabase que actúe como proxy.
   - Valida que el JWT del usuario de Supabase sea verificado en cada petición al backend.

2. **Gestión de Estados y Caché:**
   - Implementa `TanStack Query` para todas las peticiones asíncronas.
   - Define una política de `staleTime` de 5 minutos para datos financieros (QuickBooks) para evitar exceso de llamadas a la API.

3. **Estandarización de UI (NativeWind):**
   - Utiliza exclusivamente clases de Tailwind compatibles con `NativeWind`.
   - Evita estilos inline o `StyleSheet.create` a menos que sea estrictamente necesario para animaciones complejas.
   - Asegura que los componentes tengan estados de `skeleton loading` mientras las APIs responden.

4. **Flujo de Integración de Datos:**
   - **Notion:** Mapea los bloques complejos a componentes de visualización simple.
   - **QuickBooks:** Asegura el manejo de `refresh_tokens` en la tabla `starcorp_vault`.
   - **Power BI:** Gestiona los `embedTokens` de Azure para visualización en `WebView`.

5. **Validación de Código:**
   - Antes de entregar, verifica que todos los componentes tengan tipos de TypeScript definidos para las respuestas de las APIs.
   - Asegúrate de que las credenciales sensibles nunca se impriman en los logs de la consola.