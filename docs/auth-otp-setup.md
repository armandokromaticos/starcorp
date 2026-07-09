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
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F5F7; padding: 32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; width: 100%; background-color: #FFFFFF; border: 1px solid #EBEBF0; border-radius: 14px; overflow: hidden;">
        <!-- Header navy -->
        <tr>
          <td align="center" bgcolor="#1A2B6D" style="background: linear-gradient(135deg, #1A2B6D 0%, #0F1B4A 100%); padding: 24px;">
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #FFFFFF;">STARCORP</span>
          </td>
        </tr>
        <!-- Contenido -->
        <tr>
          <td style="padding: 32px 32px 40px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: #1A1F36;">Reestablece tu contraseña</h2>
            <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 22px; color: #4A5568;">Recibimos una solicitud para reestablecer la contraseña de tu cuenta en Starcorp.</p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 22px; color: #4A5568;">Ingresa este código de verificación en la app:</p>
            <!-- Código OTP -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#F5F5F7" style="background-color: #F5F5F7; border: 1px solid #EBEBF0; border-radius: 10px; padding: 18px 12px;">
                  <span style="font-family: 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #1938A5;">{{ .Token }}</span>
                </td>
              </tr>
            </table>
            <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 20px; color: #8892A4;">El código expira en 60 minutos. Si no solicitaste este cambio, puedes ignorar este correo.</p>
          </td>
        </tr>
      </table>
      <!-- Footer -->
      <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; width: 100%;">
        <tr>
          <td align="center" style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #8892A4;">© Starcorp — correo automático, no responder.</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

La plantilla usa los tokens del design system de la app (`src/theme/tokens.ts`
y `gradients.ts`): fondo `#F5F5F7`, tarjeta blanca radio 14, navy
`#1A2B6D → #0F1B4A` en el header, tipografía `#1A1F36`/`#4A5568`/`#8892A4`
y el código en azul `#1938A5`. Todo va inline y con tablas porque los
clientes de correo no soportan `<style>` ni flexbox; el `bgcolor` es el
fallback del gradiente para Outlook.

La clave es `{{ .Token }}`: es el código OTP. Mientras la plantilla solo
tenga `{{ .ConfirmationURL }}`, el correo trae un link y ningún código.

### 2. Longitud del código: 8

En la misma sección de Emails (ajustes generales de plantillas) está
**Email OTP Length**, en `8`, que coincide con las 8 cajas de la pantalla
de verificación (`MlOtpInput`, `CODE_LENGTH = 8`). La expiración
(`Email OTP Expiration`) está en 3600 s y no hace falta tocarla.

> Si se cambia la longitud en Supabase, hay que ajustar `CODE_LENGTH` en
> `src/components/molecules/ml-otp-input.tsx` y `app/(auth)/verify-code.tsx`.

## Notas

- SMTP: el proyecto usa el mailer integrado de Supabase (sin SMTP propio),
  que tiene límite de ~2 correos/hora y solo envía a miembros del equipo.
  Para producción configurar un SMTP custom (Resend, SES, etc.) en
  **Project Settings → Auth → SMTP**.
- Usuarios: `auth.users` aún no tiene usuarios reales con contraseña
  (solo sesiones anónimas). Crearlos en **Authentication → Users → Add user**.
