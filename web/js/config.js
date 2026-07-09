/** Configuración FlippArt */
const FLIPPART_CONFIG = {
  /** URL pública del sitio (SEO, Open Graph, canonical) */
  siteUrl: 'https://flippart.com.co',

  whatsapp: '573182941864',

  supabaseUrl: 'https://xoakbkmfnoiwmjtrnscy.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvYWtia21mbm9pd21qdHJuc2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDM1NzMsImV4cCI6MjA3NTQ3OTU3M30.CydhAQrumD6JxH6Aoc0UkZyh0h2jPdWrVFX9TvI1zlc',

  /** Google Search Console — pegar código de verificación si lo tienes */
  googleSiteVerification: '',

  /** Google Analytics 4 — reemplazar cuando tengas el ID real */
  gaId: '',

  /** Meta Pixel — reemplazar cuando tengas el ID real */
  metaPixelId: '',

  /** Microsoft Clarity — reemplazar cuando tengas el ID real */
  clarityId: '',

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

  /** Si no hay API automática, abre chat con FlippArt para enviar la cotización */
  fallbackOpenWhatsApp: true,
};
