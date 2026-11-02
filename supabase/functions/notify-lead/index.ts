/**
 * Notifica a FlippArt por WhatsApp cuando llega una cotización del formulario web.
 * Despliegue y secretos: ver README.md de esta carpeta.
 *
 * Secretos (supabase secrets set ...):
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_NOTIFY_TO — Meta WhatsApp Cloud API
 *   CALLMEBOT_API_KEY — alternativa gratuita (callmebot.com)
 *   ALLOWED_ORIGINS — opcional, orígenes permitidos separados por coma (por defecto, cualquiera)
 * SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente.
 *
 * Body JSON: { nombre, telefono, tipo, mensaje?, foto_path? }
 * foto_path es la ruta dentro del bucket privado lead-photos; se envía como enlace firmado temporal.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'lead-photos';
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 10_000;
const FOTO_PATH = /^cotizaciones\/[\w-]+\/[\w-]+\.(jpe?g|png|webp)$/i;

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allow = allowedOrigins.length === 0 ? '*' : allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function campo(valor: unknown, max: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, max) : '';
}

async function fetchConTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  return await fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

async function enlaceFirmado(path: string): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    if (error) {
      console.error('notify-lead: no se pudo firmar la foto', error.message);
      return null;
    }
    return data?.signedUrl ?? null;
  } catch (e) {
    console.error('notify-lead: error al firmar la foto', String(e));
    return null;
  }
}

async function sendCallMeBot(apiKey: string, phone: string, text: string): Promise<boolean> {
  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apiKey);
  try {
    const res = await fetchConTimeout(url.toString());
    if (!res.ok) console.error('notify-lead: CallMeBot respondió', res.status);
    return res.ok;
  } catch (e) {
    console.error('notify-lead: CallMeBot falló', String(e));
    return false;
  }
}

async function sendWhatsAppMeta(token: string, phoneId: string, to: string, text: string, fotoUrl: string | null): Promise<boolean> {
  const api = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    const textRes = await fetchConTimeout(api, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
    });
    if (!textRes.ok) {
      console.error('notify-lead: Meta (texto) respondió', textRes.status, await textRes.text());
      return false;
    }
  } catch (e) {
    console.error('notify-lead: Meta (texto) falló', String(e));
    return false;
  }

  if (fotoUrl) {
    try {
      const imgRes = await fetchConTimeout(api, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'image', image: { link: fotoUrl } }),
      });
      if (!imgRes.ok) console.error('notify-lead: Meta (imagen) respondió', imgRes.status);
    } catch (e) {
      // El texto ya llegó con el enlace a la foto; la imagen es un extra.
      console.error('notify-lead: Meta (imagen) falló', String(e));
    }
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, { ok: false, error: 'method_not_allowed' }, 405);

  try {
    const token = Deno.env.get('WHATSAPP_TOKEN');
    const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
    const notifyTo = Deno.env.get('WHATSAPP_NOTIFY_TO') || '573182941864';
    const callMeBotKey = Deno.env.get('CALLMEBOT_API_KEY');

    if ((!token || !phoneId) && !callMeBotKey) {
      return json(req, { ok: false, error: 'whatsapp_not_configured' }, 503);
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(req, { ok: false, error: 'payload_too_large' }, 413);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(req, { ok: false, error: 'invalid_json' }, 400);
    }
    if (!body || typeof body !== 'object') return json(req, { ok: false, error: 'invalid_json' }, 400);

    const nombre = campo(body.nombre, 120);
    const telefono = campo(body.telefono, 40);
    const tipo = campo(body.tipo, 80);
    const mensaje = campo(body.mensaje, 1500);
    const fotoPath = campo(body.foto_path, 200);
    if (!nombre || !telefono || !tipo) return json(req, { ok: false, error: 'missing_fields' }, 400);

    const fotoUrl = FOTO_PATH.test(fotoPath) ? await enlaceFirmado(fotoPath) : null;

    const text = [
      'Nueva cotización desde flippart.com.co',
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Tipo: ${tipo}`,
      mensaje ? `Detalle: ${mensaje}` : '',
      fotoUrl ? `Foto de referencia (enlace válido 7 días): ${fotoUrl}` : '',
    ].filter(Boolean).join('\n');

    let ok = false;
    let channel = '';
    if (token && phoneId) {
      ok = await sendWhatsAppMeta(token, phoneId, notifyTo, text, fotoUrl);
      channel = 'meta';
    }
    if (!ok && callMeBotKey) {
      ok = await sendCallMeBot(callMeBotKey, notifyTo, text);
      channel = 'callmebot';
    }

    if (!ok) return json(req, { ok: false, error: 'send_failed' }, 502);
    return json(req, { ok: true, channel, foto: Boolean(fotoUrl) });
  } catch (e) {
    console.error('notify-lead: error inesperado', String(e));
    return json(req, { ok: false, error: 'internal_error' }, 500);
  }
});
