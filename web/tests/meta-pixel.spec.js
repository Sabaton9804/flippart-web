const { test, expect } = require('@playwright/test');

/**
 * Meta Pixel 1137674532109255 tras el aviso de datos (Ley 1581).
 * No sale nada a Meta ni a Supabase: fbevents.js se sirve con un stub que reenvía cada evento
 * a https://www.facebook.com/tr (como el Pixel real) y esa petición se intercepta en local.
 */

const PIXEL_ID = '1137674532109255';
const CONSENT_KEY = 'flippart_consentimiento';
const FBEVENTS = /connect\.facebook\.net\/.*\/fbevents\.js/;
const PIXEL_TR = /facebook\.com\/tr/;
const OTROS_TERCEROS = /connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms|callmebot\.com/;

// Implementa callMethod como fbevents.js: vacía la cola y manda cada track a /tr con id y ev.
const FBEVENTS_STUB = `(function () {
  var fbq = window.fbq; var ids = [];
  window.__fbqLlamadas = window.__fbqLlamadas || [];
  fbq.callMethod = function (cmd, a, b) {
    window.__fbqLlamadas.push([cmd, a, b]);
    if (cmd === 'init') { ids.push(a); return; }
    if (cmd !== 'track') return;
    ids.forEach(function (id) {
      new Image().src = 'https://www.facebook.com/tr/?id=' + id + '&ev=' + encodeURIComponent(a) +
        '&cd=' + encodeURIComponent(JSON.stringify(b || {}));
    });
  };
  fbq.queue.splice(0).forEach(function (args) { fbq.callMethod.apply(fbq, args); });
})();`;

/**
 * @param {object} opts
 * @param {string|null} opts.consentimiento  decisión guardada en una visita anterior
 * @param {number} opts.leadStatus  respuesta simulada de Supabase REST para flippart_leads
 * @param {number} opts.edgeStatus  respuesta simulada de la Edge Function notify-lead
 */
async function preparar(page, { consentimiento = null, leadStatus = 201, edgeStatus = 200 } = {}) {
  const red = { fbevents: 0, pixel: [], leads: [] };

  await page.route(FBEVENTS, (route) => {
    red.fbevents += 1;
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: FBEVENTS_STUB });
  });
  await page.route(PIXEL_TR, (route) => {
    const url = new URL(route.request().url());
    red.pixel.push({ id: url.searchParams.get('id'), ev: url.searchParams.get('ev'), cd: JSON.parse(url.searchParams.get('cd') || '{}') });
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  await page.route(OTROS_TERCEROS, (route) => {
    const url = route.request().url();
    if (FBEVENTS.test(url) || PIXEL_TR.test(url)) return route.fallback();
    return route.fulfill({ status: 204, body: '' });
  });
  await page.route(/supabase\.co/, (route) => {
    const url = route.request().url();
    if (url.includes('/rest/v1/flippart_leads')) {
      red.leads.push(route.request().postDataJSON());
      return route.fulfill({ status: leadStatus, body: '' });
    }
    if (url.includes('/functions/v1/')) return route.fulfill({ status: edgeStatus, contentType: 'application/json', body: '{}' });
    return route.fulfill({ status: 201, body: '' });
  });

  await page.addInitScript(([key, valor]) => {
    if (valor && !sessionStorage.getItem('__consentimientoSembrado')) {
      localStorage.setItem(key, valor);
      sessionStorage.setItem('__consentimientoSembrado', '1');
    }
    window.__aperturas = [];
    window.open = (url) => { window.__aperturas.push(String(url)); return null; };
    // En window (después de los listeners de document): registra si alguien canceló el clic y evita salir de la página.
    window.__clicsWhatsApp = [];
    window.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!a) return;
      window.__clicsWhatsApp.push({ href: a.href, defaultPrevented: e.defaultPrevented });
      e.preventDefault();
    });
  }, [CONSENT_KEY, consentimiento]);

  return red;
}

const eventos = (red, ev) => red.pixel.filter((p) => p.ev === ev);
const llamadasFbq = (page) => page.evaluate(() => window.__fbqLlamadas || (window.fbq && window.fbq.queue
  ? window.fbq.queue.map((a) => Array.from(a)) : []));
const aviso = (page) => page.getByRole('region', { name: 'Aviso de datos y cookies' });

async function llenarFormulario(page) {
  await page.locator('#leadName').fill('Ana Prueba');
  await page.locator('#leadPhone').fill('3001234567');
  await page.locator('#leadType').selectOption('Mascota');
  await page.locator('#leadMessage').fill('Figura de mi perro');
}

test.describe('Meta Pixel tras consentimiento', () => {
  test('sin consentimiento no carga el Pixel ni envía eventos', async ({ page }) => {
    const red = await preparar(page);
    await page.goto('/');

    await expect(aviso(page)).toBeVisible();
    await page.locator('.whatsapp-float').click();
    await page.waitForTimeout(500);

    expect(red.fbevents).toBe(0);
    expect(red.pixel).toEqual([]);
    expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
    expect(await page.locator('script[src*="fbevents.js"]').count()).toBe(0);
  });

  test('al rechazar el aviso tampoco hay eventos, ni al volver', async ({ page }) => {
    const red = await preparar(page);
    await page.goto('/');
    await aviso(page).getByRole('button', { name: 'Rechazar' }).click();
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('rechazado');

    await page.reload();
    await expect(aviso(page)).toBeHidden();
    await page.locator('.whatsapp-float').click();
    await page.waitForTimeout(500);

    expect(red.fbevents).toBe(0);
    expect(red.pixel).toEqual([]);
  });

  test('tras aceptar envía PageView con el id 1137674532109255, una sola vez', async ({ page }) => {
    const red = await preparar(page);
    await page.goto('/');
    await aviso(page).getByRole('button', { name: 'Aceptar' }).click();

    await expect.poll(() => eventos(red, 'PageView').length).toBe(1);
    expect(eventos(red, 'PageView')[0].id).toBe(PIXEL_ID);
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('aceptado');
    await expect(aviso(page)).toBeHidden();

    // Visita siguiente: sin aviso, PageView al cargar y un solo snippet/init.
    await page.reload();
    await expect.poll(() => eventos(red, 'PageView').length).toBe(2);
    await expect(aviso(page)).toBeHidden();
    expect(red.fbevents).toBe(2);
    expect(await page.locator('script[src*="fbevents.js"]').count()).toBe(1);
    const inits = (await llamadasFbq(page)).filter((c) => c[0] === 'init').map((c) => c.slice(0, 2));
    expect(inits).toEqual([['init', PIXEL_ID]]);
  });

  test('clic en cualquier enlace de WhatsApp dispara Contact sin cancelar el enlace', async ({ page }) => {
    const red = await preparar(page, { consentimiento: 'aceptado' });
    await page.goto('/');
    await expect.poll(() => eventos(red, 'PageView').length).toBe(1);

    await page.locator('.whatsapp-float').click();
    await page.locator('.contact__channel[href*="wa.me/573182941864"]').click();
    await page.locator('.footer a[href*="wa.me/573182941864"]').click();

    await expect.poll(() => eventos(red, 'Contact').length).toBe(3);
    expect(eventos(red, 'Contact').every((e) => e.id === PIXEL_ID)).toBe(true);
    const clics = await page.evaluate(() => window.__clicsWhatsApp);
    expect(clics).toHaveLength(3);
    expect(clics.every((c) => !c.defaultPrevented)).toBe(true);

    // Un enlace que no es WhatsApp no cuenta como Contact.
    await page.locator('.footer a[href="#faq"]').click();
    await page.waitForTimeout(300);
    expect(eventos(red, 'Contact')).toHaveLength(3);
  });

  test('envío exitoso del formulario dispara Lead (una vez)', async ({ page }) => {
    const red = await preparar(page, { consentimiento: 'aceptado' });
    await page.goto('/#cotizar');
    await expect.poll(() => eventos(red, 'PageView').length).toBe(1);

    await llenarFormulario(page);
    await page.getByRole('button', { name: 'Enviar cotización' }).click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect.poll(() => eventos(red, 'Lead').length).toBe(1);
    expect(eventos(red, 'Lead')[0].id).toBe(PIXEL_ID);
    expect(red.leads).toHaveLength(1);
    expect(red.leads[0]).toMatchObject({ nombre: 'Ana Prueba', telefono: '3001234567', tipo: 'Mascota' });
    // La Edge Function respondió bien: no se abre WhatsApp ni hay Contact.
    expect(await page.evaluate(() => window.__aperturas)).toEqual([]);
    expect(eventos(red, 'Contact')).toEqual([]);
  });

  test('si la cotización se abre en WhatsApp (window.open) hay Contact y Lead', async ({ page }) => {
    const red = await preparar(page, { consentimiento: 'aceptado', edgeStatus: 500 });
    await page.goto('/#cotizar');
    await expect.poll(() => eventos(red, 'PageView').length).toBe(1);

    await llenarFormulario(page);
    await page.getByRole('button', { name: 'Enviar cotización' }).click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    const aperturas = await page.evaluate(() => window.__aperturas);
    expect(aperturas).toHaveLength(1);
    expect(aperturas[0]).toContain('https://wa.me/573182941864?text=');
    await expect.poll(() => eventos(red, 'Contact').length).toBe(1);
    await expect.poll(() => eventos(red, 'Lead').length).toBe(1);
  });

  test('si el envío falla no hay Lead', async ({ page }) => {
    const red = await preparar(page, { consentimiento: 'aceptado', leadStatus: 500, edgeStatus: 500 });
    await page.goto('/#cotizar');
    await expect.poll(() => eventos(red, 'PageView').length).toBe(1);
    await page.evaluate(() => { FLIPPART_CONFIG.fallbackOpenWhatsApp = false; });

    await llenarFormulario(page);
    await page.getByRole('button', { name: 'Enviar cotización' }).click();

    await expect(page.locator('#formError')).toBeVisible();
    await page.waitForTimeout(500);
    expect(eventos(red, 'Lead')).toEqual([]);
  });

  test('sin consentimiento, un envío exitoso no dispara Lead', async ({ page }) => {
    const red = await preparar(page);
    await page.goto('/#cotizar');

    await llenarFormulario(page);
    await page.getByRole('button', { name: 'Enviar cotización' }).click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    await page.waitForTimeout(500);
    expect(red.leads).toHaveLength(1);
    expect(red.fbevents).toBe(0);
    expect(red.pixel).toEqual([]);
  });
});
