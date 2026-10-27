const MEDIA = 'media';
const GALERIA = 'assets/portafolio/galeria';

const portfolioItems = [
  {
    category: 'mascotas',
    slug: 'benji',
    name: 'Benji',
    subtitle: 'Huellas imborrables',
    type: 'compare',
    original: `${GALERIA}/benji-original.webp`,
    result: `${GALERIA}/benji-figura.webp`,
  },
  {
    category: 'mascotas',
    slug: 'coco',
    name: 'Coco',
    subtitle: 'Un recuerdo que permanece',
    type: 'compare',
    original: `${GALERIA}/coco-original.webp`,
    result: 'assets/portafolio/coco-figura-vitrina.webp',
  },
  {
    category: 'mascotas',
    slug: 'estrella',
    name: 'Estrella',
    subtitle: 'Amor que ilumina',
    type: 'compare',
    original: `${GALERIA}/estrella-original.webp`,
    result: `${GALERIA}/estrella-figura.webp`,
  },
  {
    category: 'mascotas',
    slug: 'max',
    name: 'Max',
    subtitle: 'El rey de la casa',
    type: 'compare',
    original: `${GALERIA}/max-original.webp`,
    result: `${GALERIA}/max-figura.webp`,
  },
  {
    category: 'mascotas',
    slug: 'toby',
    name: 'Toby',
    subtitle: 'La alegría del hogar',
    type: 'compare',
    original: `${GALERIA}/toby-original.webp`,
    result: `${GALERIA}/toby-figura.webp`,
  },
  {
    category: 'mascotas',
    slug: 'rocco',
    name: 'Rocco',
    subtitle: 'El más consentido',
    type: 'compare',
    original: `${GALERIA}/rocco-original.webp`,
    result: `${GALERIA}/rocco-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'abuelos_pedro_rebeca',
    name: 'Boda de Diamantes',
    subtitle: 'Sesenta años de amor convertidos en arte',
    type: 'compare',
    original: `${GALERIA}/abuelos-original.webp`,
    result: `${GALERIA}/abuelos-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'familia_carolina',
    name: 'Un amor que crece en familia',
    subtitle: 'Un recuerdo de fe y amor',
    type: 'compare',
    original: `${GALERIA}/familia-original.webp`,
    result: `${GALERIA}/familia-figura.webp`,
    originalLabel: 'Imagen original',
  },
  {
    category: 'personas',
    slug: 'chica_salsa',
    name: 'Cada paso cuenta una historia',
    subtitle: 'Un homenaje al talento y a la alegría de bailar.',
    type: 'compare',
    original: `${GALERIA}/salsa-original.webp`,
    result: `${GALERIA}/salsa-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'motera_antonia',
    name: 'Pasión sin límites',
    subtitle: 'La libertad sobre dos ruedas',
    type: 'compare',
    original: `${GALERIA}/antonia-original.webp`,
    result: `${GALERIA}/antonia-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'motero_mi_nena',
    name: 'Donde comienza la aventura',
    subtitle: 'Una pasión convertida en una pieza única para recordar cada aventura.',
    type: 'compare',
    original: `${GALERIA}/mi-nena-original.webp`,
    result: `${GALERIA}/mi-nena-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'juez_gloria',
    name: 'Vocación y compromiso',
    subtitle: 'Cada detalle rinde homenaje a una trayectoria construida con ética, compromiso y dedicación',
    type: 'single',
    image: `${GALERIA}/juez-gloria-figura.webp`,
  },
  {
    category: 'personas',
    slug: 'juez_sandra',
    name: 'El honor de servir',
    subtitle: 'Cada detalle rinde homenaje a una trayectoria construida con ética, compromiso y dedicación.',
    type: 'compare',
    original: `${GALERIA}/juez-sandra-original.webp`,
    result: `${GALERIA}/juez-sandra-figura.webp`,
  },
];

const processVideos = [
  { src: `${MEDIA}/Proceso/proceso-3.mp4`, poster: 'assets/proceso/poster-proceso-3.jpg' },
  { src: `${MEDIA}/Proceso/proceso-4.mp4`, poster: 'assets/proceso/poster-proceso-4.jpg' },
  { src: `${MEDIA}/Proceso/proceso-moto.mp4`, poster: 'assets/proceso/poster-proceso-moto.jpg' },
  { src: `${MEDIA}/Proceso/proceso-1.mp4`, poster: 'assets/proceso/poster-proceso-1.jpg' },
];

function encodePath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function trackPortfolioOpen(itemName) {
  if (window.FlippartTracking) window.FlippartTracking.portfolioOpen(itemName);
}

function renderGallery(filter = 'all') {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = '';

  portfolioItems.forEach((item) => {
    if (filter !== 'all' && item.category !== filter) return;

    const el = document.createElement('article');
    el.className = 'gallery__item gallery__item--figure';
    el.dataset.category = item.category;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');

    const subtitle = item.subtitle?.trim();
    const subtitleHtml = subtitle
      ? `<p class="gallery__figure-subtitle">${subtitle.endsWith('.') ? subtitle : `${subtitle}.`}</p>`
      : '';

    let open;
    if (item.type === 'compare') {
      const label = item.originalLabel || 'Foto original';
      el.setAttribute('aria-label', `${item.name}: ver ${label.toLowerCase()} en grande`);
      el.innerHTML = `
        <h4 class="gallery__figure-title">${item.name}</h4>
        ${subtitleHtml}
        <div class="gallery__figure-row">
          <div class="gallery__figure-media">
            <img class="gallery__figure-img" src="${encodePath(item.result)}" alt="Figura FlippArt pintada a mano: ${item.name}" loading="lazy" decoding="async">
          </div>
          <aside class="gallery__figure-popover" aria-hidden="true">
            <img src="${encodePath(item.original)}" alt="${label} de ${item.name}" loading="lazy" decoding="async">
            <span>${label}</span>
          </aside>
        </div>
      `;
      open = () => openLightbox(encodePath(item.original), item.name, item.slug, el);
    } else {
      el.setAttribute('aria-label', `${item.name}: ver figura en grande`);
      el.innerHTML = `
        <h4 class="gallery__figure-title">${item.name}</h4>
        ${subtitleHtml}
        <div class="gallery__figure-row">
          <div class="gallery__figure-media">
            <img class="gallery__figure-img" src="${encodePath(item.image)}" alt="Figura FlippArt pintada a mano: ${item.name}" loading="lazy" decoding="async">
          </div>
        </div>
      `;
      open = () => openLightbox(encodePath(item.image), item.name, item.slug, el);
    }

    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
    gallery.appendChild(el);
  });
}

function renderVideos() {
  const container = document.getElementById('processVideos');
  if (!container) return;
  container.innerHTML = '';

  processVideos.forEach(({ src, poster }, i) => {
    const card = document.createElement('div');
    card.className = 'video-card';

    const video = document.createElement('video');
    video.src = encodePath(src);
    video.poster = poster;
    video.controls = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('aria-label', `Video del proceso FlippArt ${i + 1}`);

    card.appendChild(video);
    container.appendChild(card);
  });
}

let lightboxOpener = null;

function openLightbox(src, caption, itemName, opener) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const img = document.getElementById('lightboxImg');
  document.getElementById('lightboxCompare').hidden = true;
  img.hidden = false;
  img.src = src;
  img.alt = caption;
  document.getElementById('lightboxCaption').textContent = caption;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxOpener = opener || document.activeElement;
  document.getElementById('lightboxClose').focus();
  trackPortfolioOpen(itemName);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.getElementById('lightboxCompare').hidden = true;
  document.getElementById('lightboxImg').hidden = false;
  document.body.style.overflow = '';
  if (lightboxOpener && typeof lightboxOpener.focus === 'function') lightboxOpener.focus();
  lightboxOpener = null;
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(btn.dataset.lightbox, btn.dataset.caption || '', btn.dataset.item, btn);
    });
  });
}

function initGalleryFilters() {
  const filters = document.getElementById('galleryFilters');
  if (!filters) return;
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filters.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    renderGallery(btn.dataset.filter);
  });
}

function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initTamanos() {
  const tamano = typeof FLIPPART_CONFIG !== 'undefined' && FLIPPART_CONFIG.tamanoFiguraPersona;
  if (!tamano) return;
  document.querySelectorAll('[data-tamano-persona]').forEach((el) => { el.textContent = tamano; });
}

async function trackEvent(eventName, metadata = {}) {
  if (typeof FLIPPART_CONFIG === 'undefined') return;
  if (!window.FlippartTracking?.hayConsentimiento()) return;
  const { supabaseUrl, supabaseAnonKey } = FLIPPART_CONFIG;
  if (!supabaseUrl || !supabaseAnonKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/flippart_analytics_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        event_name: eventName,
        page_path: window.location.pathname + window.location.hash,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        metadata,
      }),
    });
  } catch (_) { /* silencioso */ }
}

async function saveLead({ nombre, telefono, tipo, mensaje }) {
  const { supabaseUrl, supabaseAnonKey } = FLIPPART_CONFIG || {};
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const res = await fetch(`${supabaseUrl}/rest/v1/flippart_leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ nombre, telefono, tipo, mensaje: mensaje || null }),
  });
  return res.ok;
}

function buildLeadWhatsAppText({ nombre, telefono, tipo, mensaje }) {
  return [
    'Hola FlippArt, quiero cotizar una figura.',
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Tipo: ${tipo}`,
    mensaje ? `Detalle: ${mensaje}` : '',
  ].filter(Boolean).join('\n');
}

async function notifyFlippArtCallMeBot(text) {
  const apiKey = FLIPPART_CONFIG?.callMeBotApiKey;
  const phone = FLIPPART_CONFIG?.notifyPhone || FLIPPART_CONFIG?.whatsapp;
  if (!apiKey || !phone) return false;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}`;
  try {
    await fetch(url, { mode: 'no-cors', method: 'GET' });
    return true;
  } catch (_) {
    return false;
  }
}

function whatsAppUrl(text) {
  if (window.FlippartTracking) return window.FlippartTracking.buildWhatsAppUrl(text);
  const wa = FLIPPART_CONFIG?.whatsapp || '573182941864';
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

async function notifyLeadWhatsApp(payload) {
  const { supabaseUrl, supabaseAnonKey, leadNotifyFunction } = FLIPPART_CONFIG || {};
  if (!supabaseUrl || !supabaseAnonKey || !leadNotifyFunction) return false;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${leadNotifyFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

async function submitLeadViaBackend({ nombre, telefono, tipo, mensaje }) {
  const submitUrl = FLIPPART_CONFIG?.leadSubmitUrl;
  if (!submitUrl) return null;

  const fd = new FormData();
  fd.append('nombre', nombre);
  fd.append('telefono', telefono);
  fd.append('tipo', tipo);
  fd.append('mensaje', mensaje || '');

  try {
    const res = await fetch(submitUrl, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  } catch (_) {
    return null;
  }
}

async function submitLeadFallback(lead) {
  const [leadOk, callMeBotOk, edgeOk] = await Promise.all([
    saveLead(lead).catch(() => false),
    notifyFlippArtCallMeBot(buildLeadWhatsAppText(lead)),
    notifyLeadWhatsApp(lead),
  ]);

  return {
    ok: leadOk || callMeBotOk || edgeOk,
    lead: leadOk,
    whatsapp: callMeBotOk || edgeOk,
    whatsappMode: callMeBotOk || edgeOk ? 'auto' : '',
  };
}

function initLeadForm() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const lead = {
      nombre: document.getElementById('leadName').value.trim(),
      telefono: document.getElementById('leadPhone').value.trim(),
      tipo: document.getElementById('leadType').value,
      mensaje: document.getElementById('leadMessage').value.trim(),
    };

    // Safari en iPhone bloquea window.open si llega después de un await: WhatsApp se abre aquí, en el mismo clic.
    let openedWhatsApp = false;
    if (FLIPPART_CONFIG?.fallbackOpenWhatsApp !== false) {
      const waWindow = window.open(whatsAppUrl(buildLeadWhatsAppText(lead)), '_blank');
      if (waWindow) {
        waWindow.opener = null;
        openedWhatsApp = true;
      }
    }

    success.hidden = true;
    errorEl.hidden = true;
    const defaultLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const result = (await submitLeadViaBackend(lead)) || (await submitLeadFallback(lead));

    submitBtn.disabled = false;
    submitBtn.textContent = defaultLabel;

    if (!result?.ok) {
      errorEl.textContent = 'No pudimos enviar tu cotización. Escríbenos por WhatsApp al +57 318 294 1864.';
      errorEl.hidden = false;
      return;
    }

    trackEvent('generate_lead', { tipo: lead.tipo });
    if (window.FlippartTracking) window.FlippartTracking.formSubmitted(form.dataset.formName || 'cotizacion');

    if (result.whatsappMode === 'auto') {
      success.textContent = '¡Recibimos tu cotización en nuestro WhatsApp! Te contactaremos pronto al número que indicaste.';
    } else if (openedWhatsApp) {
      success.textContent = '¡Recibimos tu cotización! Confirma el envío en el chat de WhatsApp y adjunta ahí tus fotos de referencia.';
    } else {
      success.textContent = '¡Recibimos tu cotización! Te contactaremos pronto al número que indicaste.';
    }
    success.hidden = false;
    form.reset();
  });
}

function initSectionTracking() {
  const sections = ['vitrina', 'servicios', 'galeria', 'precios', 'cotizar', 'faq', 'regalo-grado-ascenso'];
  const seen = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const { id } = entry.target;
      if (!id || seen.has(id)) return;
      seen.add(id);
      trackEvent('section_view', { section: id });
    });
  }, { threshold: 0.4 });

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

initTamanos();
initNav();
initLightbox();
initGalleryFilters();
renderGallery();
renderVideos();
if (typeof initSEO === 'function') initSEO();
trackEvent('page_view', { path: window.location.pathname });
initSectionTracking();
initLeadForm();
