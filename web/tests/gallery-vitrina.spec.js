const { test, expect } = require('@playwright/test');

/** Verifica que una imagen se muestra completa (contain, sin recorte excesivo) */
async function expectImageFullyVisible(page, imgLocator) {
  await expect(imgLocator).toBeVisible();
  await imgLocator.scrollIntoViewIfNeeded();

  const metrics = await imgLocator.evaluate((img) => {
    const style = window.getComputedStyle(img);
    const rect = img.getBoundingClientRect();
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const displayRatio = rect.width / rect.height;
    const ratioDiff = Math.abs(naturalRatio - displayRatio) / naturalRatio;

    return {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: rect.width,
      displayHeight: rect.height,
      objectFit: style.objectFit,
      complete: img.complete,
      ratioDiff,
    };
  });

  expect(metrics.complete, 'La imagen debe cargar').toBe(true);
  expect(metrics.naturalWidth, 'naturalWidth > 0').toBeGreaterThan(0);
  // Con contain, verificar que no se usa cover y que la imagen cargó
  expect(metrics.objectFit, 'object-fit debe ser contain').toBe('contain');
  expect(metrics.naturalWidth, 'naturalWidth > 0').toBeGreaterThan(100);
  expect(metrics.displayWidth, 'debe tener ancho visible').toBeGreaterThan(80);
  expect(metrics.displayHeight, 'debe tener altura visible').toBeGreaterThan(80);

  return metrics;
}

test.describe('FlippArt — vitrina y galería', () => {
  test('sección vitrina premium visible con imagen completa', async ({ page }) => {
    await page.goto('/#vitrina');
    await expect(page.locator('#vitrina')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Vitrina Premium/i })).toBeVisible();

    const heroImg = page.locator('.vitrina__hero-img');
    await expectImageFullyVisible(page, heroImg);

    const showcaseCount = await page.locator('.vitrina__card img').count();
    expect(showcaseCount).toBeGreaterThanOrEqual(3);
  });

  test('caso destacado Coco — similitud y vitrina separados', async ({ page }) => {
    await page.goto('/#galeria');
    const caseStudy = page.locator('#case-coco');
    await expect(caseStudy).toBeVisible();

    const original = caseStudy.locator('.case-study__panel').first().locator('img');
    const figure = caseStudy.locator('.case-study__figure');
    const vitrina = caseStudy.locator('.case-study__vitrina img');

    await expectImageFullyVisible(page, original);
    await expectImageFullyVisible(page, figure);
    await expectImageFullyVisible(page, vitrina);

    await caseStudy.screenshot({ path: 'tests/screenshots/caso-coco-completo.png' });
  });

  test('Coco en galería — comparación sin recorte cover', async ({ page }) => {
    await page.goto('/#galeria');
    await page.getByRole('button', { name: 'Mascotas' }).click();

    const cocoCard = page.locator('.gallery__item', { has: page.getByRole('heading', { name: 'Coco' }) });
    await expect(cocoCard).toBeVisible();

    const panels = cocoCard.locator('.gallery__compare-panel img');
    await expect(panels).toHaveCount(2);

    const original = panels.nth(0);
    const figure = panels.nth(1);

    const origMetrics = await expectImageFullyVisible(page, original);
    const figMetrics = await expectImageFullyVisible(page, figure);

    expect(origMetrics.displayHeight).toBeGreaterThan(150);
    expect(figMetrics.displayHeight).toBeGreaterThan(150);
  });

  test('lightbox comparación Coco muestra ambas fotos completas', async ({ page }) => {
    await page.goto('/#galeria');
    await page.getByRole('button', { name: 'Mascotas' }).click();

    const cocoCard = page.locator('.gallery__item', { has: page.getByRole('heading', { name: 'Coco' }) });
    await cocoCard.click();

    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    const compare = page.locator('#lightboxCompare');
    await expect(compare).toBeVisible();

    await expectImageFullyVisible(page, page.locator('#lightboxOriginal'));
    await expectImageFullyVisible(page, page.locator('#lightboxResult'));
  });

  test('captura visual — vitrina y galería Coco', async ({ page }) => {
    await page.goto('/#vitrina');
    await page.waitForTimeout(800);
    await expect(page.locator('.vitrina__hero-img')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/vitrina-hero.png', fullPage: false });

    await page.goto('/#galeria');
    await page.getByRole('button', { name: 'Mascotas' }).click();
    await page.waitForTimeout(500);

    const cocoCard = page.locator('.gallery__item', { has: page.getByRole('heading', { name: 'Coco' }) });
    await cocoCard.scrollIntoViewIfNeeded();
    await cocoCard.screenshot({ path: 'tests/screenshots/galeria-coco-compare.png' });
  });
});
