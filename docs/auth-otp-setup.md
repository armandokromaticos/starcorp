# Recuperación de contraseña por código OTP — configuración pendiente

La app ya implementa el flujo completo (correo → código de 6 dígitos → nueva
contraseña) con `resetPasswordForEmail` + `verifyOtp(type: 'recovery')`.
Falta configurar Supabase para que el correo **envíe el código** en vez del
link mágico. Esto no se pudo hacer por API (el access token del MCP devuelve
403 en `PATCH /v1/projects/{ref}/config/auth` — requiere rol Owner/Admin de
la organización), así que hay que hacerlo una vez desde el Dashboard.

## Pasos (Dashboard → proyecto `fczbzbtpyycrkxbpwhvl`)

### 1. Plantilla del correo de recovery

**Authentication → Emails → Templates → Reset password**

- Subject: `Tu código para reestablecer la contraseña`
- Body — reemplazar el contenido actual (que usa `{{ .ConfirmationURL }}`) por:

```html
<h2>Reestablece tu contraseña</h2>

<p>Recibimos una solicitud para reestablecer la contraseña de tu cuenta en Starcorp.</p>
<p>Ingresa este código de verificación en la app:</p>
<h1 style="letter-spacing: 6px;">{{ .Token }}</h1>
<p>El código expira en 60 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
```

La clave es `{{ .Token }}`: es el código OTP. Mientras la plantilla solo
tenga `{{ .ConfirmationURL }}`, el correo trae un link y ningún código.

### 2. Longitud del código: 8 → 6

En la misma sección de Emails (ajustes generales de plantillas) está
**Email OTP Length**, hoy en `8`. Cambiarla a `6` para que coincida con las
6 cajas de la pantalla de verificación (`MlOtpInput`). La expiración
(`Email OTP Expiration`) está en 3600 s y no hace falta tocarla.

> Si se prefiere dejarla en 8, hay que subir `CODE_LENGTH` a 8 en
> `src/components/molecules/ml-otp-input.tsx` y `app/(auth)/verify-code.tsx`.

## Notas

- SMTP: el proyecto usa el mailer integrado de Supabase (sin SMTP propio),
  que tiene límite de ~2 correos/hora y solo envía a miembros del equipo.
  Para producción configurar un SMTP custom (Resend, SES, etc.) en
  **Project Settings → Auth → SMTP**.
- Usuarios: `auth.users` aún no tiene usuarios reales con contraseña
  (solo sesiones anónimas). Crearlos en **Authentication → Users → Add user**.
