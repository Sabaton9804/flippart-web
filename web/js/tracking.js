/*!
 * tracking.js — Medición FlippArt.
 * Se incluye en el <head> después de config.js. Responsabilidades:
 *  1. Cargar Meta Pixel, GA4 y Clarity SOLO si su ID existe en FLIPPART_CONFIG.
 *  2. Persistir utm_source / utm_campaign en sessionStorage.
 *  3. Una sola función (buildWhatsAppUrl) arma todas las URL wa.me; whatsapp() dispara whatsapp_click.
 *  4. offer_view (IntersectionObserver 50 %, una vez), portfolio_open y form_submit.
 * Todas las llamadas a fbq/gtag/clarity van con guardas typeof === 'function'.
 */
(function (w, d) {
  'use strict';
  // config.js declara `const FLIPPART_CONFIG`, que no queda en window.
  var CFG = (typeof FLIPPART_CONFIG !== 'undefined' && FLIPPART_CONFIG) || w.FLIPPART_CONFIG || {};
  var WA_NUMBER = String(CFG.whatsapp || '573182941864').replace(/\D/g, '');
  var log = (w.__flippartEvents = w.__flippartEvents || []); // registro local para QA

  /* ---------- 1. Carga condicional de scripts ---------- */

  if (CFG.metaPixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    w.fbq('init', CFG.metaPixelId);
    w.fbq('track', 'PageView');
  }

  if (CFG.gaId) {
    var g = d.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.gaId);
    d.head.appendChild(g);
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag('js', new Date());
    w.gtag('config', CFG.gaId);
  }

  if (CFG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(w, d, 'clarity', 'script', CFG.clarityId);
  }

  /* ---------- helpers con guardas ---------- */
  function meta() { if (typeof w.fbq === 'function') { try { w.fbq.apply(null, arguments); } catch (e) {} } }
  function ga() { if (typeof w.gtag === 'function') { try { w.gtag.apply(null, arguments); } catch (e) {} } }
  function clar(name) { if (typeof w.clarity === 'function') { try { w.clarity('event', name); } catch (e) {} } }
  function record(name, params) { log.push({ event: name, params: params || {}, t: Date.now() }); }

  /* ---------- 2. UTM persistidos en sessionStorage ---------- */
  var UTM_KEY = 'flippart_utm';
  function readUtm() {
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(UTM_KEY) || '{}') || {}; } catch (e) {}
    try {
      var q = new URLSearchParams(w.location.search);
      ['utm_source', 'utm_campaign'].forEach(function (k) { if (q.get(k)) stored[k] = q.get(k); });
      sessionStorage.setItem(UTM_KEY, JSON.stringify(stored));
    } catch (e) {}
    return stored;
  }
  var UTM = readUtm();

  /* ---------- 3. WhatsApp: UNA función ---------- */
  // Mensajes aprobados en el brief final (26-oct-2026). El HTML elige con data-wa-msg; si no, por data-offer.
  var WA_TEXT = {
    general: 'Hola Camilo, vi la página de FlippArt y quiero cotizar una figura personalizada de: ___',
    grado: 'Hola Camilo, vi la página de FlippArt. Quiero un regalo de grado/ascenso. Es para: ___ (Policía/Ejército/Armada/FAC). Fecha de la ceremonia: ___',
    pregunta: 'Hola Camilo, vengo de la página de FlippArt y tengo una pregunta:',
    grado_ascenso_premium: 'Hola Camilo, me interesa la Edición Honor ($300.000) para un grado/ascenso. Es para: ___. Fecha: ___. Te envío la foto en uniforme.',
    grado_ascenso_entrada: 'Hola Camilo, me interesa la Edición Esencial (desde $120.000) para un grado/ascenso. Es para: ___. Fecha: ___.'
  };
  var LOCATIONS = ['hero', 'sticky_mobile', 'oferta_premium', 'oferta_entrada', 'portafolio', 'footer', 'cta_final'];

  function buildWhatsAppUrl(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text || WA_TEXT.general);
  }

  function textFor(el) {
    var key = el.getAttribute('data-wa-msg');
    var offer = el.getAttribute('data-offer') || 'general';
    return WA_TEXT[key] || WA_TEXT[offer] || WA_TEXT.general;
  }

  /**
   * Arma la URL wa.me de un CTA y, si fire=true, dispara whatsapp_click.
   * @param {HTMLElement} el  enlace con data-cta-location y data-offer (opcional data-wa-msg)
   */
  function whatsapp(el, fire) {
    var loc = el.getAttribute('data-cta-location') || 'desconocido';
    var offer = el.getAttribute('data-offer') || 'general';
    var url = buildWhatsAppUrl(textFor(el));
    el.setAttribute('href', url);
    if (fire) {
      var params = { cta_location: loc, offer: offer, utm_source: UTM.utm_source || '(none)', utm_campaign: UTM.utm_campaign || '(none)' };
      record('whatsapp_click', params);
      meta('track', 'Contact', { content_name: loc });
      ga('event', 'whatsapp_click', params);
      clar('whatsapp_click');
    }
    return url;
  }

  /* ---------- 4a. form_submit (solo tras éxito) ---------- */
  function formSubmitted(formName) {
    var params = { form_name: formName || 'cotizacion' };
    record('form_submit', params);
    meta('track', 'Lead');
    ga('event', 'generate_lead', params);
    clar('form_submit');
  }

  /* ---------- 4b. portfolio_open (solo GA4 + Clarity) ---------- */
  function portfolioOpen(itemName) {
    var params = { item_name: itemName || 'sin_nombre' };
    record('portfolio_open', params);
    ga('event', 'portfolio_open', params);
    clar('portfolio_open');
  }

  /* ---------- 4c. offer_view ---------- */
  function offerViewed() {
    record('offer_view', { offer: 'grado_ascenso' });
    meta('track', 'ViewContent', { content_name: 'grado_ascenso' });
    ga('event', 'view_promotion', { promotion_id: 'grado_ascenso', promotion_name: 'Regalo de grado y ascenso' });
    clar('offer_view');
  }

  function init() {
    var ctas = d.querySelectorAll('a[data-cta-location]');
    Array.prototype.forEach.call(ctas, function (el) { whatsapp(el, false); });

    // El enlace abre WhatsApp de forma nativa (target=_blank, sin await), así Safari no lo bloquea.
    d.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('a[data-cta-location]');
      if (el) whatsapp(el, true);
    });

    var offer = d.getElementById('regalo-grado-ascenso');
    if (offer && 'IntersectionObserver' in w) {
      var seen = false;
      // 50 % del elemento o, si es más alto que la pantalla (móvil), 50 % de la pantalla.
      var th = []; for (var i = 0; i <= 20; i++) th.push(i / 20);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var vh = (en.rootBounds && en.rootBounds.height) || w.innerHeight;
          var need = 0.5 * Math.min(en.boundingClientRect.height, vh);
          if (!seen && en.isIntersecting && en.intersectionRect.height >= need) {
            seen = true; io.disconnect(); offerViewed();
          }
        });
      }, { threshold: th });
      io.observe(offer);
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  w.FlippartTracking = {
    whatsapp: whatsapp,
    buildWhatsAppUrl: buildWhatsAppUrl,
    formSubmitted: formSubmitted,
    portfolioOpen: portfolioOpen,
    LOCATIONS: LOCATIONS,
    WA_TEXT: WA_TEXT
  };
})(window, document);
