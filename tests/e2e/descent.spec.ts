// S08: the descent from 8 to 40 m — courses tabs, interludes, depth ladder, comparison, bubbles.
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

const isDesktop = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;
/** The depths of the ladder (I-04, D24), shallowest first. */
const LADDER_DEPTHS = ['6', '18', '20', '30', '40', '45', '60', '70', '120'];

async function gotoMoving(page: Page): Promise<void> {
  await gotoReady(page, '/');
  await expect(page.locator('html')).toHaveClass(/\bmotion-ready\b/);
}

async function expectEveryRung(page: Page): Promise<void> {
  const rungs = page.locator('#depth [data-ladder-rung]');
  await expect(rungs).toHaveCount(LADDER_DEPTHS.length);
  const depths = await page
    .locator('#depth .rung-depth')
    .evaluateAll((elements) => elements.map((element) => element.textContent?.match(/\d+/)?.[0]));
  expect(depths).toEqual(LADDER_DEPTHS);
  await expect(page.locator('#depth')).toContainText('PTH120');
}

const requestBubbles = (page: Page) =>
  page.evaluate(() =>
    document.dispatchEvent(
      new CustomEvent('bv:bubbles', { detail: { x: 200, y: 400, count: 8, depth: 10 } }),
    ),
  );

test.describe('descent with motion', () => {
  test('every rung of the ladder is in the page, pinned on a desktop only', async ({ page }) => {
    await gotoMoving(page);
    await expectEveryRung(page);
    const pinned = page.locator('#depth[data-pinned]');
    if (!isDesktop(page)) {
      await expect(pinned).toHaveCount(0);
      return;
    }
    await expect(pinned).toHaveCount(1);
    // Halfway through the pin, the ruler reads a depth between the surface and 120 m, and the
    // HUD steps aside.
    const top = await page.locator('[data-ladder-stage]').evaluate((stage) => {
      const spacer = stage.parentElement as HTMLElement;
      return spacer.getBoundingClientRect().top + window.scrollY;
    });
    await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 1.5), top);
    await expect
      .poll(async () => Number(await page.locator('[data-ladder-depth]').textContent()))
      .toBeGreaterThan(20);
    await expect(page.locator('.hud')).toHaveAttribute('data-mode', 'hidden');
  });

  test('the courses tabs keep the APG keyboard model under the sliding light', async ({ page }) => {
    await gotoMoving(page);
    const tablist = page.locator('#agencies [role="tablist"]');
    await expect(tablist).toHaveAttribute('data-indicator', '');
    const tabs = tablist.getByRole('tab');
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#agency-padi')).toBeVisible();
    await expect(page.locator('#agency-sdi')).toBeHidden();
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toBeFocused();
    await expect(page.locator('#agency-ffessm')).toHaveAttribute('role', 'tabpanel');
    // Once the entrance is over, nothing is left transparent or shifted.
    await expect(page.locator('#agency-ffessm')).toHaveCSS('opacity', '1');
  });

  test('bubbles get one canvas, only when asked for', async ({ page }) => {
    await gotoMoving(page);
    await expect(page.locator('canvas[data-bubbles]')).toHaveCount(0);
    await requestBubbles(page);
    const canvas = page.locator('canvas[data-bubbles]');
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas).toHaveCSS('pointer-events', 'none');
  });

  test('the interludes trade the cursor for a ring on a fine pointer only', async ({ page }) => {
    await gotoMoving(page);
    const cursor = await page
      .locator('#interlude-descent')
      .evaluate((element) => getComputedStyle(element).cursor);
    const fine = await page.evaluate(
      () => matchMedia('(hover: hover) and (pointer: fine)').matches,
    );
    expect(cursor).toBe(fine ? 'none' : 'auto');
  });
});

test.describe('descent with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the ladder is the static list, without pin, and no bubble ever shows', async ({ page }) => {
    await gotoReady(page, '/');
    await expectEveryRung(page);
    await expect(page.locator('#depth[data-pinned]')).toHaveCount(0);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    // A normal section: no room kept for a pinned scroll of three screens.
    const ratio = await page.evaluate(
      () => (document.getElementById('depth')?.offsetHeight ?? 0) / window.innerHeight,
    );
    expect(ratio).toBeLessThan(3);
    await requestBubbles(page);
    await expect(page.locator('canvas[data-bubbles]')).toHaveCount(0);
    await expect(page.locator('#interlude-descent')).toHaveCSS('cursor', 'auto');
  });
});
