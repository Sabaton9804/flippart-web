/**
 * Recibe cotizaciones con foto y notifica por WhatsApp (CallMeBot o Meta API).
 * Variables en Netlify → Site settings → Environment variables:
 *   CALLMEBOT_API_KEY, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_NOTIFY_TO,
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const SUPABASE_URL = 'https://xoakbkmfnoiwmjtrnscy.supabase.co';
const STORAGE_BUCKET = 'lead-photos';
const DEFAULT_NOTIFY_PHONE = '573182941864';

/** Opcional: pegar API key de https://www.callmebot.com/blog/free-api-whatsapp-messages/ */
const CALLMEBOT_API_KEY_INLINE = '';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function buildLeadText({ nombre, telefono, tipo, mensaje, hasPhoto }) {
  return [
    'Hola FlippArt, quiero cotizar una figura.',
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Tipo: ${tipo}`,
    mensaje ? `Detalle: ${mensaje}` : '',
    hasPhoto ? 'Adjuntaré mi foto de referencia en este chat.' : '',
  ].filter(Boolean).join('\n');
}

async function uploadPhoto(serviceKey, photoFile) {
  if (!serviceKey || !photoFile) return null;
  const safeName = photoFile.name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
  const path = `${Date.now()}-${safeName}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': photoFile.type || 'application/octet-stream',
    },
    body: photoFile,
  });
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

async function saveLead(serviceKey, payload) {
  if (!serviceKey) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/flippart_leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function sendCallMeBot({ apiKey, phone, text }) {
  if (!apiKey) return false;
  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apiKey);
  const res = await fetch(url.toString());
  return res.ok;
}

async function sendWhatsAppMeta({ token, phoneId, to, text, imageUrl }) {
  if (!token || !phoneId || !to) return false;
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

  if (imageUrl) {
    await fetch(api, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: { link: imageUrl },
      }),
    });
  }
  return true;
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  try {
    const form = await req.formData();
    const nombre = String(form.get('nombre') || '').trim();
    const telefono = String(form.get('telefono') || '').trim();
    const tipo = String(form.get('tipo') || '').trim();
    const mensaje = String(form.get('mensaje') || '').trim();
    const photoFile = form.get('foto');

    if (!nombre || !telefono || !tipo) {
      return json({ ok: false, error: 'missing_fields' }, 400);
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const notifyPhone = process.env.WHATSAPP_NOTIFY_TO || DEFAULT_NOTIFY_PHONE;

    const fotoUrl = await uploadPhoto(serviceKey, photoFile instanceof File ? photoFile : null);

    const leadPayload = {
      nombre,
      telefono,
      tipo,
      mensaje: mensaje || null,
      ...(fotoUrl ? { foto_url: fotoUrl } : {}),
    };
    const leadOk = await saveLead(serviceKey, leadPayload);

    const text = buildLeadText({
      nombre,
      telefono,
      tipo,
      mensaje,
      hasPhoto: photoFile instanceof File,
    });
    const whatsappOk = await sendWhatsAppMeta({
      token: process.env.WHATSAPP_TOKEN,
      phoneId: process.env.WHATSAPP_PHONE_ID,
      to: notifyPhone,
      text,
      imageUrl: fotoUrl,
    }) || await sendCallMeBot({
      apiKey: process.env.CALLMEBOT_API_KEY || CALLMEBOT_API_KEY_INLINE,
      phone: notifyPhone,
      text,
    });

    if (!leadOk && !whatsappOk) {
      return json({ ok: false, error: 'delivery_failed' }, 502);
    }

    return json({ ok: true, lead: leadOk, whatsapp: whatsappOk, foto_url: fotoUrl });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
};
