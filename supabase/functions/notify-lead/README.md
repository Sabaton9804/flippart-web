# notify-lead

Envía a WhatsApp de FlippArt un aviso por cada cotización del formulario (`web/js/main.js`). Si se adjuntó foto, incluye un enlace firmado válido 7 días. Si la función falla o no está desplegada, el formulario sigue funcionando: la cotización se guarda en `flippart_leads` y el cliente abre WhatsApp igual.

## Despliegue (proyecto `xoakbkmfnoiwmjtrnscy`)

Desde la raíz del repo, con la [Supabase CLI](https://supabase.com/docs/guides/cli) instalada:

1. Iniciar sesión y enlazar el proyecto:

   ```bash
   supabase login
   supabase link --project-ref xoakbkmfnoiwmjtrnscy
   ```

2. Aplicar la migración `supabase/migrations/20260630_lead_photos.sql`. Crea la columna `flippart_leads.foto_url`, el bucket privado `lead-photos` (8 MB, JPEG/PNG/WebP) y la política de subida anónima.

   ```bash
   supabase db push
   ```

   También se puede pegar el contenido del archivo en Dashboard → SQL Editor y ejecutarlo. Es idempotente.

3. Configurar los secretos. Usa Meta WhatsApp Cloud API, CallMeBot o ambos (si Meta falla, usa CallMeBot):

   ```bash
   supabase secrets set WHATSAPP_TOKEN=... WHATSAPP_PHONE_ID=... WHATSAPP_NOTIFY_TO=573182941864
   supabase secrets set CALLMEBOT_API_KEY=...
   # Opcional: restringir CORS
   supabase secrets set ALLOWED_ORIGINS=https://flippart.com.co,https://www.flippart.com.co
   ```

   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen en el entorno de la función; no hay que configurarlos.

4. Desplegar la función sin verificación de JWT (el formulario la llama con la clave anónima; `supabase/config.toml` ya trae `verify_jwt = false`):

   ```bash
   supabase functions deploy notify-lead --no-verify-jwt
   ```

5. Comprobar que ya no responde 404:

   ```bash
   curl -i -X OPTIONS https://xoakbkmfnoiwmjtrnscy.supabase.co/functions/v1/notify-lead
   # 204 con cabeceras Access-Control-Allow-*
   curl -i -X POST https://xoakbkmfnoiwmjtrnscy.supabase.co/functions/v1/notify-lead \
     -H 'Content-Type: application/json' \
     -d '{"nombre":"Prueba","telefono":"3000000000","tipo":"Otro"}'
   # 200 {"ok":true,...} o 503 whatsapp_not_configured si faltan secretos
   ```

## Respuestas

| Estado | `error` | Significado |
| --- | --- | --- |
| 200 | — | Aviso enviado (`channel`: `meta` o `callmebot`) |
| 400 | `invalid_json` / `missing_fields` | Falta nombre, teléfono o tipo |
| 405 | `method_not_allowed` | Solo `POST` (y `OPTIONS` para CORS) |
| 413 | `payload_too_large` | Body de más de 10 KB |
| 502 | `send_failed` | Meta y CallMeBot fallaron (detalle en Logs de la función) |
| 503 | `whatsapp_not_configured` | No hay secretos de WhatsApp |

Con Meta Cloud API, los mensajes de texto libre solo llegan si el número de destino escribió al número de la API en las últimas 24 horas; fuera de esa ventana hace falta una plantilla aprobada.
