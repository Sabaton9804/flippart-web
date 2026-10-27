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
