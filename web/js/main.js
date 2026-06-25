const MEDIA = 'media';
const ASSETS = 'assets';

const portfolioItems = [
  {
    category: 'mascotas',
    name: 'Benji',
    type: 'compare',
    original: `${ASSETS}/gallery/benji/original.png`,
    result: `${ASSETS}/gallery/benji/figura.png`,
    fallbackOriginal: `${MEDIA}/Mascotas/Bengi/Orginal.jpeg`,
    fallbackResult: `${MEDIA}/Mascotas/Bengi/listo.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Coco',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Coco/Original Coco.jpeg`,
    result: `${MEDIA}/Mascotas/Coco/Figura Coco.png`,
  },
  {
    category: 'mascotas',
    name: 'Estrella',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Estrella/original.png`,
    result: `${MEDIA}/Mascotas/Estrella/Caja oficial.png`,
  },
  {
    category: 'mascotas',
    name: 'Max',
    type: 'compare',
    original: `${MEDIA}/Mascotas/Max/original.jpeg`,
    result: `${MEDIA}/Mascotas/Max/Max.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Toby',
    type: 'single',
    image: `${MEDIA}/Mascotas/Toby/Toby.jpeg`,
  },
  {
    category: 'mascotas',
    name: 'Rocco',
    type: 'single',
    image: `${MEDIA}/Mascotas/Rocco/Rocco.jpeg`,
  },
  {
    category: 'personas',
    name: 'Abuelos Pedro y Rebeca',
    type: 'compare',
    original: `${MEDIA}/Personas/Familiares/Abuelos Pedro y Rebeca/Abuelos.jpeg`,
    result: `${MEDIA}/Personas/Familiares/Abuelos Pedro y Rebeca/Figura Abuelos.jpeg`,
  },
  {
    category: 'personas',
    name: 'Familia Carolina',
    type: 'compare',
    original: `${MEDIA}/Personas/Familiares/Familia Carolina/Original Familia.jpeg`,
    result: `${MEDIA}/Personas/Familiares/Familia Carolina/Figura familia.jpeg`,
  },
  {
    category: 'personas',
    name: 'Chica Salsa',
    type: 'compare',
    original: `${MEDIA}/Personas/Hobbies/Chica Salsa/Original.jpeg`,
    result: `${MEDIA}/Personas/Hobbies/Chica Salsa/Figura chica salsa.jpeg`,
  },
  {
    category: 'personas',
    name: 'Motero Antonia',
    type: 'compare',
    original: `${MEDIA}/Personas/Hobbies/Motero Antonia/WhatsApp Image 2026-05-17 at 5.17.25 PM (6).jpeg`,
    result: `${MEDIA}/Personas/Hobbies/Motero Antonia/Motero.jpeg`,
  },
  {
    category: 'personas',
    name: 'Motero Mi Nena',
    type: 'compare',
    original: `${MEDIA}/Personas/Hobbies/Motero Mi Nena/Original .jpeg`,
    result: `${MEDIA}/Personas/Hobbies/Motero Mi Nena/Figura.jpeg`,
  },
  {
    category: 'personas',
    name: 'Juez Gloria',
    type: 'single',
    image: `${MEDIA}/Personas/Reconocimientos Juez/Juez Gloria/Figura Juez Gloria M .png`,
  },
  {
    category: 'personas',
    name: 'Juez Sandra',
    type: 'compare',
    original: `${MEDIA}/Personas/Reconocimientos Juez/Juez Sandra/Original.jpg`,
    result: `${MEDIA}/Personas/Reconocimientos Juez/Juez Sandra/Juez figura Sandra.jpeg`,
  },
  {
    category: 'proceso',
    name: 'Figura terminada',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (1).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Detalle artístico',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (2).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Obra iluminada',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (3).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Presentación premium',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (4).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Figura personalizada',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (5).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Retrato con alma',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (6).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Homenaje eterno',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM (7).jpeg`,
  },
  {
    category: 'proceso',
    name: 'Arte FlippArt',
    type: 'single',
    image: `${MEDIA}/Figuras Fotos/WhatsApp Image 2026-05-17 at 5.17.25 PM.jpeg`,
  },
  {
    category: 'proceso',
    name: 'Publicidad mascotas',
    type: 'single',
    image: `${MEDIA}/Publicidad/Publicidad mascotas.jpg`,
  },
  {
    category: 'proceso',
    name: 'Publicidad moto',
    type: 'single',
    image: `${MEDIA}/Publicidad/Moto publicidad.jpg`,
  },
];

const processVideos = [
  `${MEDIA}/Proceso/WhatsApp Video 2026-05-17 at 5.17.48 PM.mp4`,
  `${MEDIA}/Proceso/WhatsApp Video 2026-05-17 at 5.21.21 PM.mp4`,
  `${MEDIA}/Proceso/WhatsApp Video 2026-05-17 at 5.27.15 PM.mp4`,
  `${MEDIA}/Mascotas/Bengi/Video.mp4`,
  `${MEDIA}/Publicidad/WhatsApp Video 2026-05-22 at 9.21.47 AM.mp4`,
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

    const categoryLabel = {
      mascotas: 'Mascota',
      personas: 'Persona',
      proceso: 'Proceso',
    }[item.category];

    if (item.type === 'compare') {
      el.classList.add('gallery__item--figure');
      el.innerHTML = `
        <h4 class="gallery__figure-title">${item.name}</h4>
        <div class="gallery__figure-media">
          <img class="gallery__figure-img" src="${encodePath(item.result)}"${imageFallbackAttr(item, 'fallbackResult')} alt="Figura FlippArt de ${item.name}" loading="lazy">
          <div class="gallery__figure-popover" aria-hidden="true">
            <img src="${encodePath(item.original)}"${imageFallbackAttr(item, 'fallbackOriginal')} alt="Foto original de ${item.name}" loading="lazy">
            <span>Foto original</span>
          </div>
        </div>
      `;
      el.addEventListener('click', () => openLightbox(
        el.querySelector('.gallery__figure-popover img')?.src || encodePath(item.original),
        item.name,
      ));
    } else {
      el.innerHTML = `
        <div class="gallery__single">
          <img src="${encodePath(item.image)}" alt="Obra FlippArt: ${item.name} — figura personalizada artesanal" loading="lazy">
        </div>
        <div class="gallery__info">
          <h4>${item.name}</h4>
          <span>${categoryLabel}</span>
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
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', `Proceso creativo ${i + 1}`);

    video.addEventListener('loadeddata', () => {
      if (video.currentTime === 0) video.currentTime = 0.5;
    });

    const label = document.createElement('p');
    label.textContent = `Proceso creativo ${i + 1}`;

    card.appendChild(video);
    card.appendChild(label);
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
    const hasPhoto = photoInput.files?.length > 0;

    const text = [
      'Hola FlippArt, quiero cotizar una figura.',
      '',
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Tipo: ${tipo}`,
      mensaje ? `Detalle: ${mensaje}` : '',
      hasPhoto ? 'Adjuntaré mi foto de referencia en este chat.' : '',
    ].filter(Boolean).join('\n');

    if (FLIPPART_CONFIG?.formEmail) {
      try {
        await fetch(`https://formsubmit.co/ajax/${FLIPPART_CONFIG.formEmail}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ nombre, telefono, tipo, mensaje, _subject: `Nuevo lead FlippArt — ${nombre}` }),
        });
      } catch (_) { /* WhatsApp sigue como canal principal */ }
    }

    try {
      await saveLead({ nombre, telefono, tipo, mensaje });
      trackEvent('generate_lead', { tipo });
    } catch (_) { /* continúa a WhatsApp */ }

    if (typeof gtag === 'function') gtag('event', 'generate_lead', { method: 'form' });
    if (typeof fbq === 'function') fbq('track', 'Lead');

    const wa = FLIPPART_CONFIG?.whatsapp || '573156247293';
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');

    success.hidden = false;
    form.reset();
    preview.hidden = true;
  });
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

initSectionTracking();
renderGallery();
renderVideos();
initSEO();
initAnalytics();
initLeadForm();
