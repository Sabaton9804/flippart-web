const { test, expect } = require('@playwright/test');

/**
 * Aviso de datos, medición y CTA de WhatsApp. No envía eventos reales: Meta, Google, Clarity y Supabase
 * se interceptan y responden en local.
 */

const PIXEL_ID = '1137674532109255';
const GA_PRUEBA = 'G-PRUEBA0000';
const CLARITY_PRUEBA = 'pruebaclar';
const WA = 'https://wa.me/573182941864?text=';
const MSG = {
  general: 'Hola Camilo, vi la página de FlippArt y quiero cotizar una figura personalizada de: ___',
  grado: 'Hola Camilo, vi la página de FlippArt. Quiero un regalo de grado/ascenso. Es para: ___ (Policía/Ejército/Armada/FAC). Fecha de la ceremonia: ___',
  pregunta: 'Hola Camilo, vengo de la página de FlippArt y tengo una pregunta:',
  honor: 'Hola Camilo, me interesa la Edición Honor ($300.000) para un grado/ascenso. Es para: ___. Fecha: ___. Te envío la foto en uniforme.',
  esencial: 'Hola Camilo, me interesa la Edición Esencial (desde $120.000) para un grado/ascenso. Es para: ___. Fecha: ___.',
};
const TERCEROS = /connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms|callmebot\.com/;
const MEDICION = /connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms/;
const CONSENT_KEY = 'flippart_consentimiento';

/**
 * @param {object} opts
 * @param {number} opts.leadStatus  respuesta simulada de Supabase para el lead
 * @param {string} opts.consentimiento  decisión previa guardada en localStorage (visita anterior)
 * @param {boolean} opts.todosLosIds  sirve config.js con IDs de prueba de GA4 y Clarity para verificar que tampoco cargan
 */
async function preparar(page, { leadStatus = 201, consentimiento = null, todosLosIds = false } = {}) {
  const red = { terceros: [], leads: [], analytics: [] };
  const consola = [];
  page.on('console', (m) => { if (m.type() === 'error') consola.push(m.text()); });
  page.on('pageerror', (e) => consola.push(`pageerror: ${e.message}`));

  await page.route(TERCEROS, (route) => {
    red.terceros.push(route.request().url());
    return route.fulfill({ status: 204, body: '' });
  });
  await page.route(/supabase\.co/, (route) => {
    const url = route.request().url();
    if (url.includes('/rest/v1/flippart_leads')) {
      red.leads.push(route.request().postDataJSON());
      return route.fulfill({ status: leadStatus, body: '' });
    }
    if (url.includes('/rest/v1/flippart_analytics_events')) red.analytics.push(route.request().postDataJSON());
    if (url.includes('/functions/v1/')) return route.fulfill({ status: leadStatus === 201 ? 200 : 500, body: '{}' });
    return route.fulfill({ status: 201, body: '' });
  });
  if (todosLosIds) {
    await page.route(/\/js\/config\.js/, async (route) => {
      const resp = await route.fetch();
      const body = (await resp.text())
        .replace("gaId: ''", `gaId: '${GA_PRUEBA}'`)
        .replace("clarityId: ''", `clarityId: '${CLARITY_PRUEBA}'`);
      return route.fulfill({ response: resp, body });
    });
  }

  // Registra el orden de window.open y fetch para comprobar que WhatsApp se abre antes de cualquier await.
  await page.addInitScript(([key, valor]) => {
    if (valor && !sessionStorage.getItem('__consentimientoSembrado')) {
      localStorage.setItem(key, valor);
      sessionStorage.setItem('__consentimientoSembrado', '1');
    }
    window.__orden = [];
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = (...args) => { window.__orden.push(`fetch ${String(args[0])}`); return fetchOriginal(...args); };
    window.open = (url) => { window.__orden.push(`open ${url}`); return { opener: 'x' }; };
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[data-cta-location]');
      if (a) e.preventDefault();
    }, true);
  }, [CONSENT_KEY, consentimiento]);
  return { red, consola };
}

const llamadasFbq = (page) => page.evaluate(() => (window.fbq && window.fbq.queue ? window.fbq.queue.map((a) => JSON.parse(JSON.stringify(Array.from(a)))) : null));
const eventos = (page, nombre) => page.evaluate((n) => (window.__flippartEvents || []).filter((e) => e.event === n), nombre);
const tipos = (page) => page.evaluate(() => [typeof window.fbq, typeof window.gtag, typeof window.clarity]);
const aviso = (page) => page.getByRole('region', { name: 'Aviso de datos y cookies' });

async function verificarCtas(page, esperado, { conMeta = true } = {}) {
  const ctas = page.locator('a[data-cta-location]');
  const total = await ctas.count();
  expect(total).toBeGreaterThan(0);
  for (let i = 0; i < total; i += 1) {
    const cta = ctas.nth(i);
    const loc = await cta.getAttribute('data-cta-location');
    const msgKey = (await cta.getAttribute('data-wa-msg')) || (await cta.getAttribute('data-offer'));
    const href = await cta.getAttribute('href');
    expect(href.startsWith(WA), `${loc}: ${href}`).toBe(true);
    const texto = decodeURIComponent(href.slice(WA.length));
    expect(texto, `mensaje de ${loc} (${msgKey})`).toBe(esperado(loc, msgKey));
    await cta.dispatchEvent('click');
  }
  const locs = await ctas.evaluateAll((els) => els.map((el) => el.dataset.ctaLocation));
  expect((await eventos(page, 'whatsapp_click')).map((e) => e.params.cta_location)).toEqual(locs);
  if (conMeta) {
    const contact = (await llamadasFbq(page)).filter((c) => c[0] === 'track' && c[1] === 'Contact');
    expect(contact).toHaveLength(total);
    expect(contact.map((c) => c[2].content_name)).toEqual(locs);
  }
  return locs;
}

const mensajeHome = (loc, key) => {
  if (key === 'grado') return MSG.grado;
  if (key === 'pregunta') return MSG.pregunta;
  return MSG.general;
};

test.describe('Aviso de datos y cookies', () => {
  for (const ruta of ['/index.html', '/grado-ascenso.html']) {
    test(`${ruta}: nada carga antes de aceptar; al aceptar, Pixel init + PageView`, async ({ page }) => {
      const { red, consola } = await preparar(page, { todosLosIds: true });
      await page.goto(ruta, { waitUntil: 'networkidle' });

      await expect(aviso(page)).toBeVisible();
      await expect(aviso(page).getByRole('button', { name: 'Aceptar' })).toBeVisible();
      await expect(aviso(page).getByRole('button', { name: 'Rechazar' })).toBeVisible();
      await expect(aviso(page)).toContainText('Meta, Google Analytics y Microsoft Clarity');
      expect(await tipos(page)).toEqual(['undefined', 'undefined', 'undefined']);
      expect(red.terceros).toEqual([]);
      expect(red.analytics).toEqual([]);

      await aviso(page).getByRole('button', { name: 'Aceptar' }).click();
      await expect(aviso(page)).toBeHidden();
      expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('aceptado');
      expect(await tipos(page)).toEqual(['function', 'function', 'function']);
      const fbq = await llamadasFbq(page);
      expect(fbq).toContainEqual(['init', PIXEL_ID]);
      expect(fbq).toContainEqual(['track', 'PageView']);
      expect(await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)).filter((a) => a[0] === 'config'))).toEqual([['config', GA_PRUEBA]]);
      await expect.poll(() => red.terceros.some((u) => u.includes('fbevents.js'))).toBe(true);
      await expect.poll(() => red.terceros.some((u) => u.includes(`gtag/js?id=${GA_PRUEBA}`))).toBe(true);
      await expect.poll(() => red.terceros.some((u) => u.includes(`clarity.ms/tag/${CLARITY_PRUEBA}`))).toBe(true);

      // Visita siguiente: la decisión se recuerda y no se vuelve a preguntar.
      await page.reload({ waitUntil: 'networkidle' });
      await expect(aviso(page)).toHaveCount(0);
      expect(await llamadasFbq(page)).toContainEqual(['init', PIXEL_ID]);
      expect(consola).toEqual([]);
    });

    test(`${ruta}: al rechazar nada se carga y WhatsApp funciona igual`, async ({ page }) => {
      const { red, consola } = await preparar(page, { todosLosIds: true });
      await page.goto(ruta, { waitUntil: 'networkidle' });
      await aviso(page).getByRole('button', { name: 'Rechazar' }).click();
      await expect(aviso(page)).toBeHidden();
      expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('rechazado');

      const esperado = ruta === '/index.html' ? mensajeHome : (loc, key) => ({
        grado: MSG.grado,
        pregunta: MSG.pregunta,
        grado_ascenso_premium: MSG.honor,
        grado_ascenso_entrada: MSG.esencial,
      }[key] || MSG.general);
      await verificarCtas(page, esperado, { conMeta: false });

      await page.reload({ waitUntil: 'networkidle' });
      await expect(aviso(page)).toHaveCount(0);
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(500);
      expect(await tipos(page)).toEqual(['undefined', 'undefined', 'undefined']);
      expect(red.terceros.filter((u) => MEDICION.test(u))).toEqual([]);
      expect(red.analytics).toEqual([]);
      expect(consola).toEqual([]);
    });
  }

  test('al rechazar, el formulario funciona igual (WhatsApp, lead y mensaje de éxito)', async ({ page }) => {
    const { red, consola } = await preparar(page, { consentimiento: 'rechazado' });
    await page.goto('/index.html#contacto', { waitUntil: 'networkidle' });
    await expect(aviso(page)).toHaveCount(0);
    await page.evaluate(() => { window.__orden.length = 0; });

    await page.fill('#leadName', 'Prueba QA');
    await page.fill('#leadPhone', '3000000000');
    await page.selectOption('#leadType', 'Grado o ascenso');
    await page.click('#leadForm [type="submit"]');
    await expect(page.locator('#formSuccess')).toBeVisible();

    const orden = await page.evaluate(() => window.__orden);
    expect(orden[0]).toMatch(/^open https:\/\/wa\.me\/573182941864\?text=/);
    expect(red.leads).toHaveLength(1);
    expect(await eventos(page, 'form_submit')).toHaveLength(1);
    expect(await tipos(page)).toEqual(['undefined', 'undefined', 'undefined']);
    expect(red.terceros.filter((u) => MEDICION.test(u))).toEqual([]);
    expect(red.analytics).toEqual([]);
    expect(consola).toEqual([]);
  });

  test('el enlace del footer vuelve a abrir el aviso con el foco en Aceptar', async ({ page }) => {
    await preparar(page, { consentimiento: 'rechazado' });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Preferencias de datos y cookies' }).click();
    await expect(aviso(page)).toBeVisible();
    await expect(aviso(page).getByRole('button', { name: 'Aceptar' })).toBeFocused();
    await aviso(page).getByRole('button', { name: 'Aceptar' }).click();
    expect(await llamadasFbq(page)).toContainEqual(['init', PIXEL_ID]);
  });
});

test.describe('Medición FlippArt (con consentimiento)', () => {
  test('home: cada CTA abre wa.me/573182941864 con su mensaje y dispara Contact', async ({ page }) => {
    const { consola } = await preparar(page, { consentimiento: 'aceptado' });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    const locs = await verificarCtas(page, mensajeHome);
    expect(new Set(locs)).toEqual(new Set(['hero', 'cta_final', 'portafolio', 'footer', 'sticky_mobile']));
    const viewContent = (await llamadasFbq(page)).filter((c) => c[1] === 'ViewContent');
    expect(viewContent).toHaveLength(0);
    expect(consola).toEqual([]);
  });

  test('grado-ascenso: CTA, ViewContent una sola vez y 0 errores de consola', async ({ page }) => {
    const { consola } = await preparar(page, { consentimiento: 'aceptado' });
    const resp = await page.goto('/grado-ascenso.html', { waitUntil: 'networkidle' });
    expect(resp.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Su uniforme, su grado, su logro: en una figura pintada a mano');

    const locs = await verificarCtas(page, (loc, key) => ({
      grado: MSG.grado,
      pregunta: MSG.pregunta,
      grado_ascenso_premium: MSG.honor,
      grado_ascenso_entrada: MSG.esencial,
    }[key] || MSG.general));
    expect(new Set(locs)).toEqual(new Set(['hero', 'oferta_premium', 'oferta_entrada', 'cta_final', 'footer', 'sticky_mobile']));

    for (let i = 0; i < 2; i += 1) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.locator('#regalo-grado-ascenso').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const viewContent = (await llamadasFbq(page)).filter((c) => c[1] === 'ViewContent');
    expect(viewContent).toEqual([['track', 'ViewContent', { content_name: 'grado_ascenso' }]]);
    expect(consola).toEqual([]);
  });

  test('portfolio_open al abrir una foto del portafolio', async ({ page }) => {
    await preparar(page, { consentimiento: 'aceptado' });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    await page.locator('[data-item="sc_calderon_placa"]').click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).toBeHidden();
    expect((await eventos(page, 'portfolio_open')).map((e) => e.params.item_name)).toEqual(['sc_calderon_placa']);
  });

  for (const caso of [
    { nombre: 'éxito', leadStatus: 201, lead: 1, visible: '#formSuccess' },
    { nombre: 'fallo', leadStatus: 500, lead: 0, visible: '#formError' },
  ]) {
    test(`formulario (${caso.nombre}): WhatsApp antes de cualquier await y Lead solo si result.ok`, async ({ page }) => {
      const { red, consola } = await preparar(page, { leadStatus: caso.leadStatus, consentimiento: 'aceptado' });
      await page.goto('/index.html#contacto', { waitUntil: 'networkidle' });
      await page.evaluate(() => { window.__orden.length = 0; });

      await page.fill('#leadName', 'Prueba QA');
      await page.fill('#leadPhone', '3000000000');
      await page.selectOption('#leadType', 'Grado o ascenso');
      await page.click('#leadForm [type="submit"]');
      await expect(page.locator(caso.visible)).toBeVisible();

      const orden = await page.evaluate(() => window.__orden);
      expect(orden[0]).toMatch(/^open https:\/\/wa\.me\/573182941864\?text=/);
      expect(orden.slice(1).some((o) => o.includes('/rest/v1/flippart_leads'))).toBe(true);
      expect(red.leads).toHaveLength(1);
      expect(red.leads[0]).toEqual({ nombre: 'Prueba QA', telefono: '3000000000', tipo: 'Grado o ascenso', mensaje: null });

      const lead = (await llamadasFbq(page)).filter((c) => c[0] === 'track' && c[1] === 'Lead');
      expect(lead).toHaveLength(caso.lead);
      expect(await eventos(page, 'form_submit')).toHaveLength(caso.lead);
      // En el caso de fallo, el 500 simulado de Supabase lo registra Chromium como recurso fallido.
      const esperado500 = (m) => caso.leadStatus === 500 && m.includes('status of 500');
      expect(consola.filter((m) => !esperado500(m))).toEqual([]);
    });
  }
});

test.describe('Contenido', () => {
  test('home: sin testimonios ni Review/AggregateRating, sin $250.000 y tamaño de personas desde config.js', async ({ page }) => {
    await preparar(page, { consentimiento: 'rechazado' });
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    const html = await page.content();
    for (const nombre of ['María Fernanda R.', 'Paola Martinez O.', 'Sandra L.']) expect(html).not.toContain(nombre);
    expect(await page.locator('#testimonios, .testimonial').count()).toBe(0);
    expect(html).not.toContain('250.000');
    await expect(page.locator('.hero__text')).toContainText('Desde $120.000');

    const ld = await page.evaluate(() => document.getElementById('structured-data').textContent);
    expect(ld).not.toMatch(/Review|AggregateRating|aggregateRating|250000/);

    const tamanos = await page.locator('[data-tamano-persona]').allTextContents();
    expect(tamanos).toEqual(['12 cm aprox.', '12 cm aprox.']);
  });
});
