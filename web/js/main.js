const MEDIA = 'media';
const ASSETS = 'assets';

const portfolioItems = [
  {
    category: 'mascotas',
    name: 'Benji',
    subtitle: 'Huellas imborrables',
    type: 'compare',
    original: `${ASSETS}/gallery/benji/original.png`,
    result: `${ASSETS}/gallery/benji/figura.png`,
    fallbackOriginal: `${MEDIA}/Mascotas/Bengi/Orginal.jpeg`,
    fallbackResult: `${MEDIA}/Mascotas/Bengi/listo.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Coco',
    subtitle: 'Un recuerdo que permanece',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Coco/Original Coco.jpeg`,
    result: `${MEDIA}/Mascotas/Coco/Figura Coco.png`,
  },
  {
    category: 'mascotas',
    name: 'Estrella',
    subtitle: 'Amor que ilumina',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Estrella/original.png`,
    result: `${MEDIA}/Mascotas/Estrella/Caja oficial.png`,
  },
  {
    category: 'mascotas',
    name: 'Max',
    subtitle: 'El rey de la casa',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Max/original.jpeg`,
    result: `${MEDIA}/Mascotas/Max/Max.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Toby',
    subtitle: 'La alegría del hogar',
    type: 'compare',
    original: `${ASSETS}/gallery/toby/original.png`,
    result: `${MEDIA}/Mascotas/Toby/Toby.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Rocco',
    subtitle: 'El más consentido',
    type: 'compare',
    original: `${ASSETS}/gallery/rocco/original.png`,
    result: `${ASSETS}/gallery/rocco/figura.png`,
    fallbackResult: `${MEDIA}/Mascotas/Rocco/Rocco.jpeg`,
  },
  {
    category: 'personas',
    name: 'Boda de Diamantes',
    subtitle: 'Sesenta años de amor convertidos en arte',
    type: 'compare',
    original: `${MEDIA}/Personas/Familiares/Abuelos Pedro y Rebeca/Abuelos.jpeg`,
    result: `${MEDIA}/Personas/Familiares/Abuelos Pedro y Rebeca/Figura Abuelos.jpeg`,
  },
  {
    category: 'personas',
    name: 'Un amor que crece en familia',
    subtitle: 'Un recuerdo de fe y amor',
    type: 'compare',
    original: `${ASSETS}/gallery/familia/original.png`,
    result: `${MEDIA}/Personas/Familiares/Familia Carolina/Figura familia.jpeg`,
    originalLabel: 'Imagen original',
  },
  {
    category: 'personas',
    name: 'Cada paso cuenta una historia',
    subtitle: 'Un homenaje al talento y a la alegría de bailar.',
    type: 'compare',
    original: `${ASSETS}/gallery/chica-salsa/original.png`,
    result: `${MEDIA}/Personas/Hobbies/Chica Salsa/Figura chica salsa.jpeg`,
    fallbackOriginal: `${MEDIA}/Personas/Hobbies/Chica Salsa/Original.jpeg`,
  },
  {
    category: 'personas',
    name: 'Pasión sin límites',
    subtitle: 'La libertad sobre dos ruedas',
    type: 'compare',
    original: `${MEDIA}/Personas/Hobbies/Motero Antonia/Motero.jpeg`,
    result: `${MEDIA}/Personas/Hobbies/Motero Antonia/WhatsApp Image 2026-05-17 at 5.17.25 PM (6).jpeg`,
  },
  {
    category: 'personas',
    name: 'Donde comienza la aventura',
    subtitle: 'Una pasión convertida en una pieza única para recordar cada aventura.',
    type: 'compare',
    original: `${MEDIA}/Personas/Hobbies/Motero Mi Nena/Original .jpeg`,
    result: `${ASSETS}/gallery/motero-mi-nena/figura.png`,
    fallbackResult: `${MEDIA}/Personas/Hobbies/Motero Mi Nena/Figura.jpeg`,
  },
  {
    category: 'personas',
    name: 'Vocación y compromiso',
    subtitle: 'Cada detalle rinde homenaje a una trayectoria construida con ética, compromiso y dedicación',
    type: 'single',
    image: `${MEDIA}/Personas/Reconocimientos Juez/Juez Gloria/Figura Juez Gloria M .png`,
  },
  {
    category: 'personas',
    name: 'El honor de servir',
    subtitle: 'Cada detalle rinde homenaje a una trayectoria construida con ética, compromiso y dedicación.',
    type: 'compare',
    original: `${MEDIA}/Personas/Reconocimientos Juez/Juez Sandra/Original.jpg`,
    result: `${MEDIA}/Personas/Reconocimientos Juez/Juez Sandra/Juez figura Sandra.jpeg`,
  },
];

const processVideos = [
  `${MEDIA}/Proceso/proceso-3.mp4`,
  `${MEDIA}/Proceso/proceso-4.mp4`,
  `${MEDIA}/Proceso/proceso-moto.mp4`,
  `${MEDIA}/Proceso/proceso-1.mp4`,
];

function encodePath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function imageFallbackAttr(item, fallbackKey) {
  if (!fallbackKey || !item[fallbackKey]) return '';
  return ` data-fallback="${encodePath(item[fallbackKey])}"`;
}

function renderGallery(filter = 'all') {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = '';

  portfolioItems.forEach((item) => {
    if (filter !== 'all' && item.category !== filter) return;

    const el = document.createElement('article');
    el.className = 'gallery__item';
    el.dataset.category = item.category;

    const subtitle = item.subtitle?.trim();
    const subtitleHtml = subtitle
      ? `<p class="gallery__figure-subtitle">${subtitle.endsWith('.') ? subtitle : `${subtitle}.`}</p>`
      : '';

    if (item.type === 'compare') {
      el.classList.add('gallery__item--figure');
      el.innerHTML = `
        <h4 class="gallery__figure-title">${item.name}</h4>
        ${subtitleHtml}
        <div class="gallery__figure-row">
          <div class="gallery__figure-media">
            <img class="gallery__figure-img" src="${encodePath(item.result)}"${imageFallbackAttr(item, 'fallbackResult')} alt="Figura FlippArt de ${item.name}" loading="lazy">
          </div>
          <aside class="gallery__figure-popover" aria-hidden="true">
            <img src="${encodePath(item.original)}"${imageFallbackAttr(item, 'fallbackOriginal')} alt="${item.originalLabel || 'Foto original'} de ${item.name}" loading="lazy">
            <span>${item.originalLabel || 'Foto original'}</span>
          </aside>
        </div>
      `;
      el.addEventListener('click', () => openLightbox(
        el.querySelector('.gallery__figure-popover img')?.src || encodePath(item.original),
        item.name,
      ));
    } else {
      el.classList.add('gallery__item--figure');
      el.innerHTML = `
        <h4 class="gallery__figure-title">${item.name}</h4>
        ${subtitleHtml}
        <div class="gallery__figure-row">
          <div class="gallery__figure-media">
            <img class="gallery__figure-img" src="${encodePath(item.image)}" alt="Obra FlippArt: ${item.name} — figura personalizada artesanal" loading="lazy">
          </div>
        </div>
      `;
      el.addEventListener('click', () => openLightbox(encodePath(item.image), item.name));
    }

    gallery.appendChild(el);
  });

  gallery.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', function handleFallback() {
      const fallback = this.dataset.fallback;
      if (!fallback || this.dataset.fallbackUsed === 'true') return;
      this.dataset.fallbackUsed = 'true';
      this.src = fallback;
    }, { once: true });
  });
}

function renderVideos() {
  const container = document.getElementById('processVideos');
  if (!container) return;
  container.innerHTML = '';

  processVideos.forEach((src, i) => {
    const card = document.createElement('div');
    card.className = 'video-card';

    const video = document.createElement('video');
    video.src = encodePath(src);
    video.controls = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', `Video del proceso FlippArt ${i + 1}`);

    video.addEventListener('loadeddata', () => {
      if (video.currentTime === 0) video.currentTime = 0.5;
    });

    card.appendChild(video);
    container.appendChild(card);
  });
}

function openLightbox(src, caption) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const compare = document.getElementById('lightboxCompare');
  const cap = document.getElementById('lightboxCaption');
  compare.hidden = true;
  img.hidden = false;
  img.src = src;
  img.alt = caption;
  cap.textContent = caption;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').hidden = true;
  document.getElementById('lightboxCompare').hidden = true;
  document.getElementById('lightboxImg').hidden = false;
  document.body.style.overflow = '';
}

document.getElementById('galleryFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(btn.dataset.filter);
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') closeLightbox();
});

document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

document.querySelectorAll('.nav__links a').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  nav.style.background = window.scrollY > 60
    ? 'rgba(10, 10, 10, 0.95)'
    : 'rgba(10, 10, 10, 0.85)';
});

function initAnalytics() {
  if (typeof FLIPPART_CONFIG === 'undefined') return;

  trackEvent('page_view', { path: window.location.pathname });

  if (FLIPPART_CONFIG.gaId) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${FLIPPART_CONFIG.gaId}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', FLIPPART_CONFIG.gaId);
  }

  if (FLIPPART_CONFIG.metaPixelId) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));
    window.fbq('init', FLIPPART_CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
  }

  if (FLIPPART_CONFIG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    }(window, document, 'clarity', 'script', FLIPPART_CONFIG.clarityId));
  }
}

async function trackEvent(eventName, metadata = {}) {
  if (typeof FLIPPART_CONFIG === 'undefined') return;
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

async function uploadLeadPhoto(file) {
  const { supabaseUrl, supabaseAnonKey, storageBucket = 'lead-photos' } = FLIPPART_CONFIG || {};
  if (!supabaseUrl || !supabaseAnonKey || !file) return null;

  const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
  const path = `${Date.now()}-${safeName}`;

  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${storageBucket}/${path}`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });
    if (!res.ok) return null;
    return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${path}`;
  } catch (_) {
    return null;
  }
}

async function saveLead({ nombre, telefono, tipo, mensaje, foto_url }) {
  const { supabaseUrl, supabaseAnonKey } = FLIPPART_CONFIG || {};
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const payload = { nombre, telefono, tipo, mensaje: mensaje || null };
  if (foto_url) payload.foto_url = foto_url;

  const res = await fetch(`${supabaseUrl}/rest/v1/flippart_leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

function buildLeadWhatsAppText({ nombre, telefono, tipo, mensaje, hasPhoto }) {
  return [
    'Hola FlippArt, quiero cotizar una figura.',
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Tipo: ${tipo}`,
    mensaje ? `Detalle: ${mensaje}` : '',
    hasPhoto ? 'Adjuntaré mi foto de referencia en este chat.' : '',
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

function openWhatsAppToFlippArt(text) {
  const wa = FLIPPART_CONFIG?.whatsapp || '573182941864';
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
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

async function submitLeadViaBackend({ nombre, telefono, tipo, mensaje, photoFile }) {
  const submitUrl = FLIPPART_CONFIG?.leadSubmitUrl;
  if (!submitUrl) return null;

  const fd = new FormData();
  fd.append('nombre', nombre);
  fd.append('telefono', telefono);
  fd.append('tipo', tipo);
  fd.append('mensaje', mensaje || '');
  if (photoFile) fd.append('foto', photoFile, photoFile.name);

  try {
    const res = await fetch(submitUrl, { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  } catch (_) {
    return null;
  }
}

async function submitLeadFallback({ nombre, telefono, tipo, mensaje, photoFile }) {
  let fotoUrl = null;
  if (photoFile) fotoUrl = await uploadLeadPhoto(photoFile);

  const payload = { nombre, telefono, tipo, mensaje, foto_url: fotoUrl };
  const text = buildLeadWhatsAppText({
    nombre,
    telefono,
    tipo,
    mensaje,
    hasPhoto: Boolean(photoFile),
  });

  const [leadOk, callMeBotOk, edgeOk] = await Promise.all([
    saveLead({ nombre, telefono, tipo, mensaje, foto_url: fotoUrl }).catch(() => false),
    notifyFlippArtCallMeBot(text),
    notifyLeadWhatsApp(payload),
  ]);

  let whatsappOk = callMeBotOk || edgeOk;
  let whatsappMode = whatsappOk ? 'auto' : '';

  if (!whatsappOk && FLIPPART_CONFIG?.fallbackOpenWhatsApp !== false) {
    openWhatsAppToFlippArt(text);
    whatsappOk = true;
    whatsappMode = 'wa_me';
  }

  return {
    ok: leadOk || whatsappOk,
    lead: leadOk,
    whatsapp: whatsappOk,
    whatsappMode,
    foto_url: fotoUrl,
  };
}

function initLeadForm() {
  const form = document.getElementById('leadForm');
  const photoInput = document.getElementById('leadPhoto');
  const preview = document.getElementById('photoPreview');
  const previewImg = document.getElementById('photoPreviewImg');
  const success = document.getElementById('formSuccess');

  if (!form) return;

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) {
      preview.hidden = true;
      return;
    }
    previewImg.src = URL.createObjectURL(file);
    preview.hidden = false;
  });

  const submitBtn = form.querySelector('[type="submit"]');
  const errorEl = document.getElementById('formError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nombre = document.getElementById('leadName').value.trim();
    const telefono = document.getElementById('leadPhone').value.trim();
    const tipo = document.getElementById('leadType').value;
    const mensaje = document.getElementById('leadMessage').value.trim();
    const photoFile = photoInput.files?.[0] || null;

    success.hidden = true;
    if (errorEl) errorEl.hidden = true;

    const defaultLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const result = (await submitLeadViaBackend({ nombre, telefono, tipo, mensaje, photoFile }))
      || (await submitLeadFallback({ nombre, telefono, tipo, mensaje, photoFile }));

    if (result?.ok && !result.whatsapp && FLIPPART_CONFIG?.fallbackOpenWhatsApp !== false) {
      const text = buildLeadWhatsAppText({
        nombre,
        telefono,
        tipo,
        mensaje,
        hasPhoto: Boolean(photoFile),
      });
      openWhatsAppToFlippArt(text);
      result.whatsapp = true;
      result.whatsappMode = 'wa_me';
    }

    trackEvent('generate_lead', { tipo, has_photo: Boolean(photoFile) });
    if (typeof gtag === 'function') gtag('event', 'generate_lead', { method: 'form' });
    if (typeof fbq === 'function') fbq('track', 'Lead');

    submitBtn.disabled = false;
    submitBtn.textContent = defaultLabel;

    if (!result?.ok) {
      if (errorEl) {
        errorEl.textContent = 'No pudimos enviar tu cotización. Escríbenos por WhatsApp al +57 318 294 1864.';
        errorEl.hidden = false;
      }
      return;
    }

    if (result.whatsappMode === 'auto') {
      success.textContent = '¡Recibimos tu cotización en nuestro WhatsApp! Te contactaremos pronto al número que indicaste.';
    } else if (result.whatsappMode === 'wa_me') {
      success.textContent = 'Confirma el envío en WhatsApp. Si adjuntaste foto, inclúyela también en el chat.';
    } else if (result.whatsapp) {
      success.textContent = '¡Recibimos tu cotización! Te contactaremos pronto por WhatsApp.';
    } else {
      success.textContent = '¡Recibimos tu cotización! Te contactaremos pronto al número que indicaste.';
    }

    success.hidden = false;
    form.reset();
    preview.hidden = true;
  });
}

function initFaqReveal() {
  const section = document.getElementById('faq');
  const items = [...document.querySelectorAll('.faq__item')];
  if (!section || !items.length) return;

  const showAll = () => {
    items.forEach((item, index) => {
      item.classList.add('faq-reveal', 'is-visible');
      item.style.transitionDelay = `${index * 0.08}s`;
    });
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (reducedMotion || isMobile) {
    showAll();
    return;
  }

  items.forEach((item) => item.classList.add('faq-reveal'));

  let revealed = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || revealed) return;
      revealed = true;
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.08}s`;
        item.classList.add('is-visible');
      });
      observer.disconnect();
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  observer.observe(section);
}

function initFaqHint() {
  const section = document.getElementById('faq');
  const faq = document.getElementById('faqList');
  const hint = document.getElementById('faqHintArrow');
  if (!section || !faq || !hint) return;

  const storageKey = 'flippart-faq-hint-shown';
  if (sessionStorage.getItem(storageKey)) {
    hint.remove();
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hintDurationMs = 3000;
  let shown = false;

  function positionHint() {
    const targetItem = [...faq.querySelectorAll('.faq__item')].find((item) => !item.open)
      || faq.querySelector('.faq__item');
    const summary = targetItem?.querySelector('summary');
    if (!summary) return;

    const top = summary.offsetTop + summary.offsetHeight / 2 - hint.offsetHeight / 2;
    hint.style.top = `${Math.max(0, top)}px`;
  }

  function hideHint() {
    hint.classList.remove('is-visible');
    hint.classList.add('is-fading');
    sessionStorage.setItem(storageKey, '1');
    window.setTimeout(() => hint.remove(), 500);
  }

  function showHint() {
    if (shown) return;
    shown = true;
    sessionStorage.setItem(storageKey, '1');
    positionHint();
    hint.classList.add('is-visible');
    window.setTimeout(hideHint, hintDurationMs);
    observer.disconnect();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) showHint();
    });
  }, { threshold: 0.3 });

  observer.observe(section);
  window.addEventListener('resize', () => {
    if (hint.isConnected && hint.classList.contains('is-visible')) positionHint();
  }, { passive: true });

  if (reducedMotion) {
    observer.disconnect();
    hint.remove();
  }
}

function initSectionTracking() {
  const sections = ['vitrina', 'servicios', 'galeria', 'precios', 'cotizar', 'faq'];
  const seen = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
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

function initScrollReveal() {
  const reveals = [...document.querySelectorAll('.section > .container')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  const revealOnce = (el) => {
    el.classList.add('reveal', 'is-visible');
  };

  if (prefersReducedMotion || isMobile()) {
    reveals.forEach(revealOnce);
    return;
  }

  reveals.forEach((el) => el.classList.add('reveal'));

  const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
  };

  const revealVisibleNow = () => {
    reveals.forEach((el) => {
      if (isInViewport(el)) revealOnce(el);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) revealOnce(entry.target);
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -10% 0px' });

  reveals.forEach((el) => {
    observer.observe(el);
  });

  revealVisibleNow();
  window.addEventListener('load', () => {
    requestAnimationFrame(revealVisibleNow);
    window.setTimeout(revealVisibleNow, 120);
  });
  window.addEventListener('hashchange', revealVisibleNow);
  window.addEventListener('resize', revealVisibleNow, { passive: true });
}

initSectionTracking();
initScrollReveal();
initFaqReveal();
initFaqHint();
renderGallery();
renderVideos();
initSEO();
initAnalytics();
initLeadForm();
