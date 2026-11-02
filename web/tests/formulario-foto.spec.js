const { test, expect } = require('@playwright/test');

/**
 * Foto de referencia del formulario de cotización. Supabase (Storage, REST y Edge Functions) se intercepta:
 * ninguna prueba toca el proyecto real.
 */

const WA = /^https:\/\/wa\.me\/573182941864\?text=/;
const FOTO_FALLIDA = 'No pudimos subir tu foto; puedes enviarla por WhatsApp.';
const RUTA_FOTO = /^cotizaciones\/\d{4}-\d{2}-\d{2}\/[\w-]+\.png$/;
const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const FOTO_OK = { name: 'referencia.png', mimeType: 'image/png', buffer: PNG_1X1 };
const LEAD = { nombre: 'Prueba QA', telefono: '3000000000', tipo: 'Grado o ascenso', mensaje: null };
const AVISO = { ...LEAD, mensaje: '' };

/**
 * @param {object} opts
 * @param {number} opts.storageStatus  respuesta simulada de Storage al subir la foto
 * @param {(body: object) => number} opts.leadStatus  respuesta de /rest/v1/flippart_leads según el body
 * @param {number} opts.notifyStatus  respuesta de la Edge Function notify-lead (hoy 404 en producción)
 * @param {boolean} opts.popupReal  no reemplaza window.open, para comprobar que el navegador abre el popup
 */
async function preparar(page, { storageStatus = 200, leadStatus = () => 201, notifyStatus = 404, popupReal = false } = {}) {
  const red = { subidas: [], leads: [], notify: [] };
  const consola = [];
  page.on('console', (m) => { if (m.type() === 'error') consola.push(m.text()); });
  page.on('pageerror', (e) => consola.push(`pageerror: ${e.message}`));

  await page.route(/connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms|callmebot\.com/,
    (route) => route.fulfill({ status: 204, body: '' }));
  await page.route(/supabase\.co/, (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname.startsWith('/storage/v1/object/')) {
      red.subidas.push({ path: url.pathname, tipo: req.headers()['content-type'], bytes: req.postDataBuffer()?.length || 0 });
      return route.fulfill({ status: storageStatus, contentType: 'application/json', body: storageStatus === 200 ? '{"Key":"ok"}' : '{"error":"Bucket not found"}' });
    }
    if (url.pathname === '/rest/v1/flippart_leads') {
      const body = req.postDataJSON();
      red.leads.push(body);
      return route.fulfill({ status: leadStatus(body), body: '' });
    }
    if (url.pathname.startsWith('/functions/v1/')) {
      red.notify.push(req.postDataJSON());
      return route.fulfill({ status: notifyStatus, body: '{}' });
    }
    return route.fulfill({ status: 201, body: '' });
  });
  // En el contexto (no en la página) para que también cubra el popup de WhatsApp.
  await page.context().route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>WhatsApp</title>' }));

  await page.addInitScript((popupRealArg) => {
    localStorage.setItem('flippart_consentimiento', 'rechazado');
    window.__orden = [];
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = (...args) => { window.__orden.push(`fetch ${String(args[0])}`); return fetchOriginal(...args); };
    if (!popupRealArg) {
      window.open = (url) => { window.__orden.push(`open ${url}`); return { opener: 'x' }; };
    }
  }, popupReal);

  await page.goto('/index.html#contacto', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__orden.length = 0; });
  return { red, consola };
}

async function llenar(page) {
  await page.fill('#leadName', LEAD.nombre);
  await page.fill('#leadPhone', LEAD.telefono);
  await page.selectOption('#leadType', LEAD.tipo);
}

const orden = (page) => page.evaluate(() => window.__orden);
const sinErroresDeRed = (consola) => consola.filter((m) => !/Failed to load resource: the server responded with a status of (400|404|500)/.test(m));

test.describe('Formulario: foto de referencia', () => {
  for (const storageStatus of [404, 500]) {
    test(`si la subida falla (${storageStatus}) el lead se guarda, sale el aviso y WhatsApp se abre en el mismo clic`, async ({ page }) => {
      const { red, consola } = await preparar(page, { storageStatus });
      await llenar(page);
      await page.setInputFiles('#leadPhoto', FOTO_OK);
      await expect(page.locator('#photoPreview')).toBeVisible();

      await page.click('#leadForm [type="submit"]');
      await expect(page.locator('#formSuccess')).toBeVisible();
      await expect(page.locator('#formPhotoWarning')).toHaveText(FOTO_FALLIDA);
      await expect(page.locator('#formPhotoWarning')).toBeVisible();
      await expect(page.locator('#formError')).toBeHidden();

      const pasos = await orden(page);
      expect(pasos[0]).toMatch(/^open https:\/\/wa\.me\/573182941864\?text=/);
      expect(pasos.findIndex((p) => p.includes('/storage/v1/object/'))).toBeGreaterThan(0);

      expect(red.subidas).toHaveLength(1);
      expect(red.subidas[0].path).toMatch(/^\/storage\/v1\/object\/lead-photos\/cotizaciones\//);
      expect(red.leads).toEqual([LEAD]);
      expect(red.notify).toEqual([AVISO]);
      await expect(page.locator('#leadPhoto')).toHaveValue('');
      expect(sinErroresDeRed(consola)).toEqual([]);
    });
  }

  test('el navegador abre el popup de WhatsApp aunque fallen la subida y notify-lead', async ({ page }) => {
    const { red } = await preparar(page, { storageStatus: 404, notifyStatus: 404, popupReal: true });
    await llenar(page);
    await page.setInputFiles('#leadPhoto', FOTO_OK);

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('#leadForm [type="submit"]'),
    ]);
    expect(popup.url()).toMatch(WA);
    expect(decodeURIComponent(new URL(popup.url()).searchParams.get('text'))).toContain(`Nombre: ${LEAD.nombre}`);
    await expect(page.locator('#formPhotoWarning')).toHaveText(FOTO_FALLIDA);
    expect(red.leads).toEqual([LEAD]);
  });

  test('si la subida funciona, el lead guarda la ruta de la foto y notify-lead la recibe', async ({ page }) => {
    const { red, consola } = await preparar(page, { storageStatus: 200, notifyStatus: 200 });
    await llenar(page);
    await page.setInputFiles('#leadPhoto', FOTO_OK);
    await page.click('#leadForm [type="submit"]');

    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect(page.locator('#formPhotoWarning')).toBeHidden();
    expect(red.subidas).toHaveLength(1);
    expect(red.subidas[0].tipo).toBe('image/png');
    expect(red.subidas[0].bytes).toBe(PNG_1X1.length);

    expect(red.leads).toHaveLength(1);
    const { foto_url: fotoUrl, ...resto } = red.leads[0];
    expect(resto).toEqual(LEAD);
    expect(fotoUrl).toMatch(RUTA_FOTO);
    expect(red.subidas[0].path).toBe(`/storage/v1/object/lead-photos/${fotoUrl}`);
    expect(red.notify).toEqual([{ ...AVISO, foto_path: fotoUrl }]);
    expect(sinErroresDeRed(consola)).toEqual([]);
  });

  test('si la columna foto_url aún no existe (400), la cotización se guarda sin foto y sale el aviso', async ({ page }) => {
    const { red } = await preparar(page, { storageStatus: 200, leadStatus: (body) => ('foto_url' in body ? 400 : 201) });
    await llenar(page);
    await page.setInputFiles('#leadPhoto', FOTO_OK);
    await page.click('#leadForm [type="submit"]');

    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect(page.locator('#formPhotoWarning')).toHaveText(FOTO_FALLIDA);
    expect(red.leads).toHaveLength(2);
    expect(red.leads[0].foto_url).toMatch(RUTA_FOTO);
    expect(red.leads[1]).toEqual(LEAD);
  });

  for (const caso of [
    { nombre: 'tipo no permitido (GIF)', archivo: { name: 'animacion.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') }, mensaje: 'Esa foto no es JPG, PNG ni WebP. Elige otra o envíala por WhatsApp.' },
    { nombre: 'PDF con extensión de imagen', archivo: { name: 'foto.jpg', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') }, mensaje: 'Esa foto no es JPG, PNG ni WebP. Elige otra o envíala por WhatsApp.' },
    { nombre: 'más de 8 MB', archivo: { name: 'grande.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(8 * 1024 * 1024 + 1) }, mensaje: 'La foto pesa más de 8 MB. Elige una más liviana o envíala por WhatsApp.' },
  ]) {
    test(`archivo inválido (${caso.nombre}): se rechaza en el cliente y la cotización se envía sin foto`, async ({ page }) => {
      const { red, consola } = await preparar(page);
      await llenar(page);
      await page.setInputFiles('#leadPhoto', caso.archivo);

      await expect(page.locator('#leadPhotoError')).toHaveText(caso.mensaje);
      await expect(page.locator('#leadPhotoError')).toBeVisible();
      await expect(page.locator('#photoPreview')).toBeHidden();
      expect(await page.locator('#leadPhoto').evaluate((el) => el.files.length)).toBe(0);

      await page.click('#leadForm [type="submit"]');
      await expect(page.locator('#formSuccess')).toBeVisible();
      await expect(page.locator('#formPhotoWarning')).toBeHidden();
      expect(red.subidas).toEqual([]);
      expect(red.leads).toEqual([LEAD]);
      expect((await orden(page))[0]).toMatch(/^open https:\/\/wa\.me\//);
      expect(sinErroresDeRed(consola)).toEqual([]);
    });
  }

  test('copy: campo opcional, formatos permitidos y sin prometer que la foto se envía con la cotización', async ({ page }) => {
    await preparar(page);
    await expect(page.locator('label[for="leadPhoto"]')).toContainText('(opcional)');
    await expect(page.locator('#leadPhoto')).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    await expect(page.locator('#leadPhoto')).not.toHaveAttribute('required', /.*/);
    await expect(page.locator('#leadPhotoHint')).toHaveText('JPG, PNG o WebP de hasta 8 MB. Si prefieres, envíala por WhatsApp al +57 318 294 1864.');
    for (const ruta of ['/index.html', '/grado-ascenso.html', '/js/main.js']) {
      const texto = await (await page.request.get(ruta)).text();
      expect(texto, ruta).not.toMatch(/se env[ií]a con (tu|la) cotizaci[oó]n/i);
    }
  });
});

test.describe('/grado-ascenso: fotos reales de SC Calderón', () => {
  test('picture con WebP y JPG en 480/960/1440, sizes, lazy fuera del hero y alt descriptivo', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('flippart_consentimiento', 'rechazado'));
    await page.goto('/grado-ascenso.html', { waitUntil: 'networkidle' });

    const imgs = page.locator('#inicio picture img, #figuras picture img');
    await expect(imgs).toHaveCount(4);
    const urls = new Set();
    for (const img of await imgs.all()) {
      const datos = await img.evaluate((el) => ({
        alt: el.alt,
        loading: el.getAttribute('loading'),
        sizes: el.getAttribute('sizes'),
        srcset: el.getAttribute('srcset'),
        src: el.getAttribute('src'),
        webp: el.parentElement.querySelector('source[type="image/webp"]')?.getAttribute('srcset'),
        webpSizes: el.parentElement.querySelector('source[type="image/webp"]')?.getAttribute('sizes'),
        enHero: Boolean(el.closest('#inicio')),
        ancho: el.getAttribute('width'),
        alto: el.getAttribute('height'),
      }));
      expect(datos.alt.length, datos.src).toBeGreaterThan(40);
      expect(datos.alt).toContain('SC Calderón');
      expect(datos.loading).toBe(datos.enHero ? 'eager' : 'lazy');
      expect(datos.sizes).toBeTruthy();
      expect(datos.webpSizes).toBe(datos.sizes);
      expect(datos.ancho).toMatch(/^\d+$/);
      expect(datos.alto).toMatch(/^\d+$/);
      for (const [srcset, ext] of [[datos.srcset, 'jpg'], [datos.webp, 'webp']]) {
        for (const w of [480, 960, 1440]) expect(srcset).toMatch(new RegExp(`-${w}\\.${ext} ${w}w`));
        srcset.split(',').forEach((c) => urls.add(c.trim().split(' ')[0]));
      }
    }
    for (const boton of await page.locator('#figuras [data-lightbox]').all()) urls.add(await boton.getAttribute('data-lightbox'));

    for (const url of urls) {
      const resp = await page.request.get(url);
      expect(resp.status(), url).toBe(200);
    }
    await expect(page.locator('.plan--entrada')).toContainText('Base negra con nombre.');
    await expect(page.locator('.plan--entrada')).toContainText('Empaque de protección.');
    await expect(page.locator('.plan--entrada .plan__precio')).toHaveText('Desde $120.000 versión mini, según tamaño');
  });
});
