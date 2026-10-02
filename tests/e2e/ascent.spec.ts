// S10: the ascent — the pinned rail of the Testimonials (E12, D45), the safety stop of the FAQ
// (E13), the gift voucher (E11) and the review dialog.
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

async function gotoMoving(page: Page, path = '/'): Promise<void> {
  await gotoReady(page, path);
  await expect(page.locator('html')).toHaveClass(/\bmotion-ready\b/);
}

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

/** Scrolls the page so that the top of a section meets the top of the screen. */
async function scrollToSection(page: Page, id: string): Promise<void> {
  await page.evaluate((target) => {
    const top = document.getElementById(target)?.getBoundingClientRect().top ?? 0;
    window.scrollTo({ top: window.scrollY + top, behavior: 'instant' });
  }, id);
}

const progressOf = (page: Page) =>
  page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>('[data-rail-progress]');
    return new DOMMatrix(bar ? getComputedStyle(bar).transform : 'none').a;
  });

test.describe('testimonials with motion', () => {
  test('the rail is pinned and the buttons scroll the page to the next quote', async ({ page }) => {
    await gotoMoving(page);
    const section = page.locator('#testimonials');
    await expect(section).toHaveAttribute('data-pinned', '');
    await scrollToSection(page, 'testimonials');
    const previous = page.locator('[data-rail-previous]');
    const next = page.locator('[data-rail-next]');
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    // Pinned: the rail no longer scrolls by itself.
    await expect(page.locator('[data-rail]')).not.toHaveAttribute('tabindex');
    const before = await scrollY(page);
    await next.click();
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect.poll(() => progressOf(page)).toBeGreaterThan(0);
    await expect(previous).toBeEnabled();
    await expect(section.locator('.testimonials-stage')).toBeInViewport();
  });

  test('a link focused at the end of the rail brings it into the window', async ({ page }) => {
    await gotoMoving(page);
    await scrollToSection(page, 'testimonials');
    const link = page.locator('#testimonials .testimonials-cta a');
    const before = await scrollY(page);
    await link.focus();
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await expect(link).toBeInViewport();
    await expect
      .poll(() => page.evaluate(() => document.querySelector('[data-rail-window]')?.scrollLeft))
      .toBe(0);
  });

  test('a review cut short opens whole in a dialog, and gives the focus back', async ({ page }) => {
    await gotoMoving(page);
    const more = page.locator('#testimonials [data-review-open]:visible');
    test.skip((await more.count()) === 0, 'every review fits this screen');
    await scrollToSection(page, 'testimonials');
    const button = more.first();
    await button.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('blockquote')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the voucher tilts towards a fine pointer', async ({ page }) => {
    await gotoMoving(page);
    const fine = await page.evaluate(
      () => matchMedia('(hover: hover) and (pointer: fine)').matches,
    );
    test.skip(!fine, 'no tilt on touch screens');
    const card = page.locator('[data-gift-card]');
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    if (box === null) throw new Error('no card');
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5, { steps: 5 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const element = document.querySelector('.gift-card');
          return element ? getComputedStyle(element).transform : 'none';
        }),
      )
      .toMatch(/^matrix3d/);
  });
});

test.describe('safety stop', () => {
  test('the HUD counts the stop down while the FAQ is in view, and lets go after', async ({
    page,
  }) => {
    await gotoReady(page, '/');
    const hud = page.locator('.hud');
    await scrollToSection(page, 'faq');
    await expect(hud).toHaveAttribute('data-mode', 'safety-stop');
    await expect(page.locator('[data-hud-alarm-text]')).toHaveText(/5\sm · 0[23]:\d\d$/);
    await expect(page.locator('[data-hud-depth]')).toHaveText(/^5[,.]0$/);
    await scrollToSection(page, 'gifts');
    await expect(hud).not.toHaveAttribute('data-mode', 'safety-stop');
  });
});

test.describe('testimonials without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a rail that snaps, with its own buttons', async ({ page }) => {
    await gotoReady(page, '/');
    await expect(page.locator('#testimonials')).not.toHaveAttribute('data-pinned');
    const rail = page.locator('[data-rail]');
    await expect(rail).toHaveAttribute('tabindex', '0');
    await expect(rail).toHaveCSS('scroll-snap-type', /x mandatory|inline mandatory/);
    await rail.scrollIntoViewIfNeeded();
    const previous = page.locator('[data-rail-previous]');
    await expect(previous).toBeDisabled();
    await page.locator('[data-rail-next]').click();
    await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(previous).toBeEnabled();
  });

  test('cutting the reviews does not move a page opened on the FAQ', async ({ page }) => {
    await gotoReady(page, '/#faq');
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() => page.evaluate(() => document.getElementById('faq')?.getBoundingClientRect().top))
      .toBeGreaterThan(-10);
    const top = await page.evaluate(
      () => document.getElementById('faq')?.getBoundingClientRect().top,
    );
    expect(top).toBeLessThan(150);
  });

  test('the long reviews are cut short from the start, and open whole', async ({ page }) => {
    await gotoReady(page, '/');
    const quotes = page.locator('[data-rail] > .testimonial-long blockquote');
    expect(await quotes.count()).toBeGreaterThan(0);
    for (const quote of await quotes.all()) {
      const { height, rem } = await quote.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        rem: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      }));
      expect(height).toBeLessThanOrEqual(16 * rem + 1);
    }
    const more = page.locator('#testimonials [data-review-open]:visible');
    expect(await more.count()).toBeGreaterThan(0);
    const button = more.first();
    await button.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('blockquote')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
  });
});
