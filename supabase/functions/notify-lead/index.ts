/**
 * Notifica a FlippArt por WhatsApp cuando llega una cotización.
 *
 * Secretos en Supabase (Dashboard → Edge Functions → Secrets):
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_NOTIFY_TO  — Meta Cloud API
 *   CALLMEBOT_API_KEY — alternativa gratuita (callmebot.com)
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendCallMeBot(apiKey: string, phone: string, text: string) {
  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apiKey);
  const res = await fetch(url.toString());
  return res.ok;
}

async function sendWhatsAppMeta(
  token: string,
  phoneId: string,
  to: string,
  text: string,
  fotoUrl?: string,
) {
  const api = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const textRes = await fetch(api, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  if (!textRes.ok) return false;

  if (fotoUrl) {
    await fetch(api, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: { link: fotoUrl },
      }),
    });
  }
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
  const notifyTo = Deno.env.get('WHATSAPP_NOTIFY_TO') || '573182941864';
  const callMeBotKey = Deno.env.get('CALLMEBOT_API_KEY');

  if ((!token || !phoneId) && !callMeBotKey) {
    return new Response(JSON.stringify({ ok: false, reason: 'whatsapp_not_configured' }), {
      status: 503,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { nombre, telefono, tipo, mensaje, foto_url } = await req.json();
    const text = [
      'Hola FlippArt, quiero cotizar una figura.',
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Tipo: ${tipo}`,
      mensaje ? `Detalle: ${mensaje}` : '',
      foto_url ? 'Adjuntaré mi foto de referencia en este chat.' : '',
    ].filter(Boolean).join('\n');

    let ok = false;
    let channel = '';

    if (token && phoneId) {
      ok = await sendWhatsAppMeta(token, phoneId, notifyTo, text, foto_url);
      channel = 'meta';
    }

    if (!ok && callMeBotKey) {
      ok = await sendCallMeBot(callMeBotKey, notifyTo, text);
      channel = 'callmebot';
    }

    if (!ok) {
      return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, channel }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
