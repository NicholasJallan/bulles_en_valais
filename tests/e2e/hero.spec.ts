import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

const browserName = (page: Page): string => page.context().browser()?.browserType().name() ?? '';
const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** Waits until the page has loaded and the main thread has been idle once (when WebGL starts). */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const idle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 200));
        idle(() => resolve(), { timeout: 2000 });
      }),
  );
}

/** Makes the browser report no WebGL: the hero keeps its CSS water line. */
async function withoutWebGL(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args) {
      return String(args[0]).startsWith('webgl') ? null : getContext.apply(this, args);
    } as typeof getContext;
  });
}

async function scrollHero(page: Page, ratio: number): Promise<void> {
  await page.evaluate((value) => {
    const hero = document.getElementById('top');
    window.scrollTo(0, (hero?.offsetHeight ?? 0) * value);
  }, ratio);
}

test.describe('hero surface (E1, E2, E15)', () => {
  test('lays the WebGL surface over the photo, without console errors', async ({ page }) => {
    test.skip(browserName(page) !== 'chromium' || !isDesktop(page), 'Chromium desktop');
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await gotoReady(page, '/');
    const canvas = page.locator('#top canvas.hero-canvas');
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveCSS('opacity', '1');
    await expect(page.locator('#top')).toHaveAttribute('data-surface', 'webgl');
    // The photo stays underneath, as the fallback.
    await expect(page.locator('#top .hero-image')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the largest contentful paint is the hero, painted at once (D41)', async ({ page }) => {
    test.skip(browserName(page) !== 'chromium', 'LCP entries exist in Chromium only');
    await gotoReady(page, '/');
    await settle(page);
    // Chromium leaves out of LCP an image covering the whole viewport (a « background »): the
    // candidate is the hero text, painted with the first frame, never after the motion module.
    const { element, lcp, fcp } = await page.evaluate(
      () =>
        new Promise<{ element: string; lcp: number; fcp: number }>((resolve) => {
          new PerformanceObserver((list) => {
            const last = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
            resolve({
              element: last.element?.closest('#top') === null ? 'outside' : 'hero',
              lcp: last.startTime,
              fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
            });
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        }),
    );
    expect(element).toBe('hero');
    expect(lcp - fcp).toBeLessThan(100);
  });

  test('the surface stops drawing once the hero has left the screen', async ({ page }) => {
    test.skip(browserName(page) !== 'chromium' || !isDesktop(page), 'Chromium desktop');
    await page.addInitScript(() => {
      const draw = WebGL2RenderingContext.prototype.drawArrays;
      const counter = { frames: 0 };
      Object.assign(window, { __draws: counter });
      WebGL2RenderingContext.prototype.drawArrays = function (...args) {
        counter.frames += 1;
        return draw.apply(this, args);
      };
    });
    const frames = () =>
      page.evaluate(() => (window as unknown as { __draws: { frames: number } }).__draws.frames);
    await gotoReady(page, '/');
    await expect(page.locator('#top')).toHaveAttribute('data-surface', 'webgl');
    // On screen, the water keeps moving.
    const before = await frames();
    await expect.poll(frames).toBeGreaterThan(before + 5);
    await page.evaluate(() => document.getElementById('about')?.scrollIntoView());
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    const settled = await frames();
    await page.waitForTimeout(500);
    expect(await frames()).toBeLessThanOrEqual(settled + 1);
  });

  test('the intro shows the title and lights the HUD at 0.0 m', async ({ page }) => {
    await gotoReady(page, '/');
    await expect(page.locator('html')).toHaveAttribute('data-intro', '');
    await expect(page.locator('.hero-title')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hud-readout')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-hud-depth]')).toHaveText(/^0[,.]0$/);
  });

  test('without WebGL, a CSS water line rises with the scroll', async ({ page }) => {
    await withoutWebGL(page);
    await gotoReady(page, '/');
    await settle(page);
    await expect(page.locator('#top canvas')).toHaveCount(0);
    const veil = page.locator('[data-hero-water]');
    await scrollHero(page, 0.3);
    await expect(veil).toHaveCSS('clip-path', /^polygon/);
    // Still on the surface: the descent starts once the hero has gone.
    await expect(page.locator('[data-hud-depth]')).toHaveText(/^0[,.]0$/);
  });

  test('a swipe on the hero scrolls the page', async ({ page }) => {
    test.skip(
      browserName(page) !== 'chromium' || isDesktop(page),
      'touch gestures through the Chromium DevTools protocol, on a phone',
    );
    await gotoReady(page, '/');
    await settle(page);
    const client = await page.context().newCDPSession(page);
    await client.send('Input.synthesizeScrollGesture', {
      x: 200,
      y: 500,
      yDistance: -300,
      gestureSourceType: 'touch',
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});

test.describe('hero with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('stays a still photo: no canvas, no veil, the title visible', async ({ page }) => {
    await gotoReady(page, '/');
    await settle(page);
    await expect(page.locator('#top canvas')).toHaveCount(0);
    await expect(page.locator('[data-hero-water]')).toBeHidden();
    await expect(page.locator('.hero-title')).toHaveCSS('opacity', '1');
  });
});
