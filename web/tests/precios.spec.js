const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, expect } = require('@playwright/test');

/**
 * Precios: definidos solo en js/config.js (FLIPPART_CONFIG.precios). El HTML trae un respaldo escrito
 * para verse bien sin JavaScript y para SEO; aquí se comprueba que ese respaldo coincide con config.js,
 * que la página toma los valores de config.js y que se cumple la regla de precios vigente.
 */

const CONFIG_JS = fs.readFileSync(path.join(__dirname, '..', 'js', 'config.js'), 'utf8');
const { FLIPPART_CONFIG, formatearPrecio } = vm.runInNewContext(`${CONFIG_JS}\n;({ FLIPPART_CONFIG, formatearPrecio })`);
const P = FLIPPART_CONFIG.precios;

const TERCEROS = /connect\.facebook\.net|facebook\.com|googletagmanager\.com|google-analytics\.com|clarity\.ms|callmebot\.com|supabase\.co/;
const PAGINAS = ['/index.html', '/grado-ascenso.html'];
const WA = 'https://wa.me/573182941864?text=';

async function preparar(page) {
  await page.route(TERCEROS, (route) => route.fulfill({ status: 204, body: '' }));
  await page.addInitScript(() => localStorage.setItem('flippart_consentimiento', 'rechazado'));
}

const jsonLd = (page) => page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')]
  .map((s) => JSON.parse(s.textContent)));

/** Todas las ofertas del JSON-LD de la página, con el nombre del servicio si la oferta no tiene uno propio. */
const ofertas = async (page) => (await jsonLd(page))
  .flatMap((d) => d['@graph'] || [d])
  .flatMap((n) => [...(n.offers || []), ...((n.hasOfferCatalog && n.hasOfferCatalog.itemListElement) || [])])
  .filter((o) => o.price)
  .map((o) => ({ nombre: o.name || o.itemOffered.name, price: o.price, minPrice: o.priceSpecification && o.priceSpecification.minPrice }));

/** "$120.000" solo puede aparecer acompañado de "versión mini". */
function expectMiniAclarado(texto, donde) {
  const apariciones = [...texto.matchAll(/\$120\.000/g)];
  for (const m of apariciones) {
    expect(texto.slice(m.index, m.index + 45), `${donde}: "$120.000" sin "versión mini"`).toMatch(/versión mini/);
  }
  return apariciones.length;
}

test('config.js: formato es-CO de los precios', () => {
  expect(formatearPrecio(150000)).toBe('$150.000');
  expect(formatearPrecio(1250000)).toBe('$1.250.000');
  expect(Object.keys(P).sort()).toEqual(['esencialMini', 'honor', 'mascotas', 'personas']);
});

test.describe('Respaldo del HTML sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const ruta of PAGINAS) {
    test(`${ruta}: cada data-precio y el JSON-LD estático coinciden con config.js`, async ({ page }) => {
      await preparar(page);
      await page.goto(ruta);
      const elementos = await page.locator('[data-precio]').evaluateAll((els) => els.map((el) => [el.dataset.precio, el.textContent]));
      expect(elementos.length).toBeGreaterThan(0);
      for (const [clave, texto] of elementos) {
        expect(P[clave], `clave data-precio="${clave}" no existe en config.js`).toBeTruthy();
        expect(texto, `respaldo de data-precio="${clave}"`).toBe(formatearPrecio(P[clave]));
      }

      if (ruta === '/grado-ascenso.html') {
        expect(await ofertas(page)).toEqual([
          { nombre: 'Edición Esencial (versión mini)', price: String(P.esencialMini), minPrice: String(P.esencialMini) },
          { nombre: 'Edición Honor', price: String(P.honor), minPrice: undefined },
        ]);
      }

      for (const sel of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
        const content = await page.locator(sel).getAttribute('content');
        expectMiniAclarado(content, `${ruta} ${sel}`);
      }
    });
  }
});

test.describe('Precios vigentes en la página', () => {
  test('home: Mascotas $150.000, Personas $250.000 (figura completa), hero $120.000 versión mini y schema igual', async ({ page }) => {
    await preparar(page);
    await page.goto('/index.html', { waitUntil: 'networkidle' });

    await expect(page.locator('.hero__text')).toContainText('Desde $120.000 (versión mini).');

    const servicio = (titulo) => page.locator('.servicio', { has: page.getByRole('heading', { name: titulo }) });
    await expect(servicio('Mascotas y homenajes').locator('.servicio__precio')).toHaveText('Desde $150.000figura individual · 8 cm');
    await expect(servicio('Personas y momentos').locator('.servicio__precio')).toHaveText('Desde $250.000figura completa · 12 cm aprox.');
    await expect(servicio('Regalo de grado y ascenso').locator('.servicio__precio')).toHaveText('Desde $120.000versión mini · Honor $300.000');

    const oferta = (titulo) => page.locator('.pricing-offer', { has: page.getByRole('heading', { name: titulo, exact: true }) });
    await expect(oferta('Mascotas').locator('.pricing-offer__amount')).toHaveText('Desde $150.000');
    await expect(oferta('Personas').locator('.pricing-offer__amount')).toHaveText('Desde $250.000');
    await expect(oferta('Personas').locator('.pricing-offer__meta')).toHaveText('Figura completa · 12 cm aprox. · Base personalizada');

    const texto = await page.locator('main').innerText();
    expect(expectMiniAclarado(texto, 'home')).toBe(2);

    expect(await ofertas(page)).toEqual([
      { nombre: 'Figura personalizada de mascota', price: '150000', minPrice: undefined },
      { nombre: 'Figura personalizada de familia o persona', price: '250000', minPrice: undefined },
      { nombre: 'Edición Esencial (versión mini)', price: '120000', minPrice: undefined },
      { nombre: 'Edición Honor', price: '300000', minPrice: undefined },
    ]);
    const webpage = (await jsonLd(page))[0]['@graph'].find((n) => n['@type'] === 'WebPage');
    expect(webpage.description).toContain('Desde $120.000 (versión mini).');
  });

  test('grado-ascenso: Esencial $120.000 versión mini, Honor $300.000 y schema igual', async ({ page }) => {
    await preparar(page);
    await page.goto('/grado-ascenso.html', { waitUntil: 'networkidle' });

    await expect(page.locator('.plan--entrada h3')).toHaveText('Edición Esencial');
    await expect(page.locator('.plan--entrada .plan__precio')).toHaveText('Desde $120.000 versión mini, según tamaño');
    await expect(page.locator('.plan--entrada li').first()).toContainText('versión mini');
    await expect(page.locator('.plan--premium h3')).toHaveText('Edición Honor');
    await expect(page.locator('.plan--premium .plan__precio')).toHaveText('$300.000');
    await expect(page.locator('.hero__text')).toContainText('Desde $120.000 (versión mini).');

    const texto = await page.locator('main').innerText();
    expect(expectMiniAclarado(texto, 'grado-ascenso')).toBe(2);

    expect(await ofertas(page)).toEqual([
      { nombre: 'Edición Esencial (versión mini)', price: '120000', minPrice: '120000' },
      { nombre: 'Edición Honor', price: '300000', minPrice: undefined },
    ]);
    await expect(page.locator('[data-offer="grado_ascenso_premium"]')).toHaveAttribute('href', `${WA}${encodeURIComponent('Hola Camilo, me interesa la Edición Honor ($300.000) para un grado/ascenso. Es para: ___. Fecha: ___. Te envío la foto en uniforme.')}`);
    await expect(page.locator('[data-offer="grado_ascenso_entrada"]')).toHaveAttribute('href', `${WA}${encodeURIComponent('Hola Camilo, me interesa la Edición Esencial (desde $120.000) para un grado/ascenso. Es para: ___. Fecha: ___.')}`);
  });
});

test.describe('Cambiar un precio en config.js lo cambia en toda la página', () => {
  const NUEVOS = { mascotas: 151000, personas: 252000, esencialMini: 123000, honor: 304000 };

  test.beforeEach(async ({ page }) => {
    await preparar(page);
    await page.route(/\/js\/config\.js/, async (route) => {
      const resp = await route.fetch();
      const body = (await resp.text()).replace(/precios: \{[^}]*\}/, `precios: ${JSON.stringify(NUEVOS)}`);
      return route.fulfill({ response: resp, body });
    });
  });

  for (const ruta of PAGINAS) {
    test(`${ruta}: textos, schema y mensajes de WhatsApp`, async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'networkidle' });
      const elementos = await page.locator('[data-precio]').evaluateAll((els) => els.map((el) => [el.dataset.precio, el.textContent]));
      expect(elementos.length).toBeGreaterThan(0);
      for (const [clave, texto] of elementos) expect(texto).toBe(formatearPrecio(NUEVOS[clave]));

      const precios = (await ofertas(page)).flatMap((o) => [o.price, o.minPrice]).filter(Boolean);
      expect(precios.length).toBeGreaterThan(0);
      for (const p of precios) expect(Object.values(NUEVOS).map(String)).toContain(p);

      const texto = await page.locator('main').innerText();
      for (const viejo of ['$150.000', '$250.000', '$120.000', '$300.000']) expect(texto).not.toContain(viejo);
      if (ruta === '/grado-ascenso.html') {
        const href = decodeURIComponent(await page.locator('[data-offer="grado_ascenso_premium"]').getAttribute('href'));
        expect(href).toContain('Edición Honor ($304.000)');
        const hrefEsencial = decodeURIComponent(await page.locator('[data-offer="grado_ascenso_entrada"]').getAttribute('href'));
        expect(hrefEsencial).toContain('Edición Esencial (desde $123.000)');
      } else {
        const webpage = (await jsonLd(page)).flatMap((d) => d['@graph'] || []).find((n) => n['@type'] === 'WebPage');
        expect(webpage.description).toContain('Desde $123.000 (versión mini).');
      }
    });
  }
});
