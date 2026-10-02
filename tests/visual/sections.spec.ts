import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { gotoReady } from '../e2e/ready.ts';

// Reference images of every section at the four key widths (S12), under reduced motion: no
// motion module, no WebGL, every reveal shown, so the page is the same on each run. The fixed
// elements (HUD, WhatsApp bubble, skip link) are hidden by floating.css.
const WIDTHS = [320, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;
const OPTIONS = {
  animations: 'disabled',
  stylePath: fileURLToPath(new URL('floating.css', import.meta.url)),
  maxDiffPixelRatio: 0.01,
} as const;
const SECTIONS = [
  'top',
  'manifesto',
  'about',
  'agencies',
  'depth',
  'compare',
  'specialties',
  'places',
  'prepare',
  'gifts',
  'testimonials',
  'faq',
  'contact',
] as const;

test.use({ reducedMotion: 'reduce' });

/** Waits for the web fonts and for every image of the page, lazy ones included. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
}

for (const width of WIDTHS) {
  test(`sections at ${width} px`, async ({ page }) => {
    test.skip(
      test.info().project.name !== 'chromium',
      'one engine and viewport set for the references',
    );
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await gotoReady(page, '/');
    await settle(page);
    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`)).toHaveScreenshot(`${id}-${width}.png`, OPTIONS);
    }
    await expect(page.locator('footer.site-footer')).toHaveScreenshot(
      `footer-${width}.png`,
      OPTIONS,
    );
  });
}
