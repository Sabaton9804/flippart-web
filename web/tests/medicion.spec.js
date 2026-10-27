const { test, expect } = require('@playwright/test');

/**
 * Medición y CTA de WhatsApp. No envía eventos reales: Meta, Google, Clarity y Supabase
 * se interceptan y responden en local.
 */

const PIXEL_ID = '1137674532109255';
const WA = 'https://wa.me/573182941864?text=';
const MSG = {
  general: 'Hola Camilo, vi la página de FlippArt y quiero cotizar una figura personalizada de: ___',
  grado: 'Hola Camilo, vi la página de FlippArt. Quiero un regalo de grado/ascenso. Es para: ___ (Policía/Ejército/Armada/FAC). Fecha de la ceremonia: ___',
  pregunta: 'Hola Camilo, vengo de la página de FlippArt y tengo una pregunta:',
  honor: 'Hola Camilo, me interesa la Edición Honor ($300.000) para un grado/ascenso. Es para: ___. Fecha: ___. Te envío la foto en uniforme.',
  esencial: 'Hola Camilo, me interesa la Edición Esencial (desde $120.000) para un grado/ascenso. Es para: ___. Fecha: ___.',
};
const TERCEROS = /connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms|callmebot\.com/;

async function preparar(page, { leadStatus = 201 } = {}) {
  const red = { terceros: [], leads: [] };
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
    if (url.includes('/functions/v1/')) return route.fulfill({ status: leadStatus === 201 ? 200 : 500, body: '{}' });
    return route.fulfill({ status: 201, body: '' });
  });

  // Registra el orden de window.open y fetch para comprobar que WhatsApp se abre antes de cualquier await.
  await page.addInitScript(() => {
    window.__orden = [];
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = (...args) => { window.__orden.push(`fetch ${String(args[0])}`); return fetchOriginal(...args); };
    window.open = (url) => { window.__orden.push(`open ${url}`); return { opener: 'x' }; };
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[data-cta-location]');
      if (a) e.preventDefault();
    }, true);
  });
  return { red, consola };
}

const llamadasFbq = (page) => page.evaluate(() => (window.fbq && window.fbq.queue ? window.fbq.queue.map((a) => JSON.parse(JSON.stringify(Array.from(a)))) : null));
const eventos = (page, nombre) => page.evaluate((n) => (window.__flippartEvents || []).filter((e) => e.event === n), nombre);

async function verificarCtas(page, esperado) {
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
  const contact = (await llamadasFbq(page)).filter((c) => c[0] === 'track' && c[1] === 'Contact');
  expect(contact).toHaveLength(total);
  const locs = await ctas.evaluateAll((els) => els.map((el) => el.dataset.ctaLocation));
  expect(contact.map((c) => c[2].content_name)).toEqual(locs);
  return locs;
}

test.describe('Medición FlippArt', () => {
  test('home: Pixel init + PageView, sin GA4/Clarity y 0 errores de consola', async ({ page }) => {
    const { red, consola } = await preparar(page);
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    const fbq = await llamadasFbq(page);
    expect(fbq).toContainEqual(['init', PIXEL_ID]);
    expect(fbq).toContainEqual(['track', 'PageView']);
    expect(await page.evaluate(() => [typeof window.gtag, typeof window.clarity])).toEqual(['undefined', 'undefined']);
    expect(red.terceros.filter((u) => /googletagmanager|google-analytics|clarity/.test(u))).toEqual([]);
    expect(await page.locator('#leadPhoto, input[type="file"]').count()).toBe(0);
    expect(consola).toEqual([]);
  });

  test('home: cada CTA abre wa.me/573182941864 con su mensaje y dispara Contact', async ({ page }) => {
    await preparar(page);
    await page.goto('/index.html', { waitUntil: 'networkidle' });
    const locs = await verificarCtas(page, (loc, key) => {
      if (key === 'grado') return MSG.grado;
      if (key === 'pregunta') return MSG.pregunta;
      return MSG.general;
    });
    expect(new Set(locs)).toEqual(new Set(['hero', 'cta_final', 'portafolio', 'footer', 'sticky_mobile']));
    const viewContent = (await llamadasFbq(page)).filter((c) => c[1] === 'ViewContent');
    expect(viewContent).toHaveLength(0);
  });

  test('grado-ascenso: CTA, ViewContent una sola vez y 0 errores de consola', async ({ page }) => {
    const { consola } = await preparar(page);
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
    await preparar(page);
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
      const { red } = await preparar(page, { leadStatus: caso.leadStatus });
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
    });
  }
});
