import { expect, test } from '@playwright/test';
import { gotoReady } from '../e2e/ready.ts';

// Reference image of the hero with WebGL switched off (S07): the CSS water line at rest, once the
// intro has settled. The HUD (dive time) and the WhatsApp bubble float over it: masked.
test('hero without WebGL', async ({ page }) => {
  const browser = page.context().browser()?.browserType().name();
  test.skip(browser !== 'chromium', 'one rendering engine for the reference images');
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args) {
      return String(args[0]).startsWith('webgl') ? null : getContext.apply(this, args);
    } as typeof getContext;
  });
  await gotoReady(page, '/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', '');
  // The intro has settled: every title line back in place, the HUD lit.
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('.hero-title .reveal-line')).every((line) =>
          ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(line).transform),
        ),
      ),
    )
    .toBe(true);
  await expect(page.locator('.hud-readout')).toHaveCSS('opacity', '1');
  await expect(page.locator('#top')).toHaveScreenshot('hero-no-webgl.png', {
    mask: [page.locator('.hud'), page.locator('.whatsapp-fab')],
    maxDiffPixelRatio: 0.01,
  });
});
