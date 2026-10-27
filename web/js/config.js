/** Configuración FlippArt */
const FLIPPART_CONFIG = {
  /** URL pública del sitio (SEO, Open Graph, canonical) */
  siteUrl: 'https://flippart.com.co',

  whatsapp: '573182941864',

  supabaseUrl: 'https://xoakbkmfnoiwmjtrnscy.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDM1NzMsImV4cCI6MjA3NTQ3OTU3M30.CydhAQrumD6JxH6Aoc0UkZyh0h2jPdWrVFX9TvI1zlc',

  /** Google Search Console — verificación DNS + meta tag */
  googleSiteVerification: 'l3mk0FH4SNiNGvsDKHhKjBhEObNnZDkIuPfM2J5z6D8',

  /** Google Analytics 4 — ejemplo: G-XXXXXXXXXX */
  gaId: '',

  /** Meta Pixel FlippArt (lo carga js/tracking.js) */
  metaPixelId: '1137674532109255',

  /** Microsoft Clarity — ejemplo: abcdefghij */
  clarityId: '',

  /**
   * Política de tratamiento de datos (Ley 1581). El aviso de cookies la enlaza solo si hay URL.
   * TODO(Camilo): el sitio aún no tiene política de datos publicada; poner aquí su URL cuando exista.
   */
  politicaDatosUrl: '',

  /** Tamaño de las figuras de personas. main.js lo escribe en cada elemento con data-tamano-persona. */
  tamanoFiguraPersona: '12 cm aprox.',

  /**
   * Precios base en COP. PROVISIONALES: hay un estudio de mercado en curso.
   * main.js los escribe (como "$150.000") en cada elemento con data-precio="clave" y en las ofertas del JSON-LD
   * de /grado-ascenso; seo.js los usa en el schema de la home y tracking.js en los mensajes de WhatsApp.
   * Al cambiarlos, actualizar también el texto de respaldo del HTML (lo exige tests/precios.spec.js) y las
   * meta description/og/twitter de index.html y grado-ascenso.html, que son estáticas.
   */
  precios: {
    mascotas: 150000,
    personas: 250000,
    esencialMini: 120000,
    honor: 300000,
  },

  /** Instagram — usado en schema sameAs y meta social */
  instagram: 'https://instagram.com/Flippart.oficial',

  /** Bucket de Supabase para fotos de referencia */
  storageBucket: 'lead-photos',

  /**
   * Edge Function de Supabase que notifica por WhatsApp Business API.
   * Requiere configurar secretos en Supabase (ver supabase/functions/notify-lead).
   */
  leadNotifyFunction: 'notify-lead',

  /** Endpoint del backend. Vacío en Hostinger (usa Supabase + WhatsApp). */
  leadSubmitUrl: '',

  /** Teléfono donde llegan alertas de cotización (CallMeBot / WhatsApp API) */
  notifyPhone: '573182941864',

  /** API key CallMeBot → alertas automáticas a tu WhatsApp (callmebot.com) */
  callMeBotApiKey: '',

  /** Al enviar el formulario abre (en el mismo clic) el chat de WhatsApp con los datos de la cotización */
  fallbackOpenWhatsApp: true,
};

/** 150000 → "$150.000" (es-CO). */
function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-CO')}`;
}
