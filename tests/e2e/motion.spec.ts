import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

async function gotoMoving(page: Page, path = '/'): Promise<void> {
  await gotoReady(page, path);
  await expect(page.locator('html')).toHaveClass(/\bmotion-ready\b/);
}

/** Depth shown by the HUD, in metres (« 12,4 » or « 12.4 »). */
async function hudDepth(page: Page): Promise<number> {
  const text = (await page.locator('[data-hud-depth]').textContent()) ?? '';
  return Number(text.replace(',', '.'));
}

async function scrollToSection(page: Page, id: string): Promise<void> {
  await page.evaluate((anchor) => {
    const top = document.getElementById(anchor)?.getBoundingClientRect().top ?? 0;
    window.scrollTo(0, window.scrollY + top);
  }, id);
}

/** Every reveal is visible: nothing transparent, no image clipped. */
async function hiddenReveals(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      .filter((element) => {
        const style = getComputedStyle(element);
        const children = Array.from(element.children).map((child) => getComputedStyle(child));
        return (
          style.opacity === '0' ||
          (style.clipPath !== 'none' && style.clipPath !== '') ||
          children.some((child) => child.opacity === '0')
        );
      })
      .map((element) => element.outerHTML.slice(0, 80)),
  );
}

test.describe('motion', () => {
  test('the HUD reads the depth of the section scrolled to', async ({ page }) => {
    await gotoMoving(page);
    await expect.poll(() => hudDepth(page)).toBe(0);
    await scrollToSection(page, 'specialties');
    // Specialties run from 40 to 32 m; the probe line sits a little below the top of the section.
    await expect.poll(() => hudDepth(page)).toBeGreaterThanOrEqual(32);
    expect(await hudDepth(page)).toBeLessThanOrEqual(40);
    await expect(page.locator('[data-hud-temperature]')).toHaveText(/^8\s°C$/);
  });

  test('a page opened on an anchor starts its motion', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await gotoMoving(page, '/#agencies');
    expect(errors).toEqual([]);
  });

  test('the HUD hides itself in the depth ladder', async ({ page }) => {
    await gotoMoving(page);
    await scrollToSection(page, 'depth');
    await expect(page.locator('.hud')).toHaveAttribute('data-mode', 'hidden');
  });

  test('the dive profile is a list of real links', async ({ page }) => {
    await gotoMoving(page);
    await page.getByRole('button', { name: 'Afficher le profil de plongée' }).click();
    const profile = page.getByRole('navigation', { name: 'Profil de plongée' });
    await expect(profile).toBeVisible();
    await profile.getByRole('link', { name: /Bons cadeaux/ }).click();
    await expect(profile).toBeHidden();
    await expect(page).toHaveURL(/#gifts$/);
  });

  test('anchors land on their section and move the focus there', async ({ page }) => {
    test.skip(isMobile(page), 'the links are in the mobile menu (controllers.spec.ts)');
    await gotoMoving(page);
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'FAQ' })
      .click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.locator('#faq-title')).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => document.getElementById('faq')?.getBoundingClientRect().top))
      .toBeLessThan(150);
  });

  test('loading and scrolling the whole page shift nothing (CLS < 0.05)', async ({ page }) => {
    await page.addInitScript(() => {
      const shifts = { total: 0 };
      Object.assign(window, { __shifts: shifts });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) shifts.total += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    test.skip(
      (await page.context().browser()?.browserType().name()) !== 'chromium',
      'layout-shift entries exist in Chromium only',
    );
    await gotoMoving(page);
    const steps = 24;
    for (let step = 1; step <= steps; step += 1) {
      await page.evaluate(
        (ratio) => window.scrollTo(0, ratio * document.documentElement.scrollHeight),
        step / steps,
      );
      await page.waitForTimeout(120);
    }
    const total = await page.evaluate(
      () => (window as unknown as { __shifts: { total: number } }).__shifts.total,
    );
    expect(total).toBeLessThan(0.05);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no smooth scrolling, every reveal visible, the HUD still reads the depth', async ({
    page,
  }) => {
    await gotoReady(page, '/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/\bmotion-ok\b/);
    await expect(html).not.toHaveClass(/\blenis\b/);
    expect(await hiddenReveals(page)).toEqual([]);
    await scrollToSection(page, 'specialties');
    await expect.poll(() => hudDepth(page)).toBe(40);
  });
});

test.describe('calm mode', () => {
  test('the page stays complete without motion', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bv-calm', '1'));
    await gotoReady(page, '/');
    await expect(page.locator('html')).not.toHaveClass(/\bmotion-ok\b/);
    expect(await hiddenReveals(page)).toEqual([]);
  });
});

test.describe('boot.js safety net', () => {
  test('without the motion module after 3 s, everything shows', async ({ page }) => {
    // Hold back the motion module (the only script that writes nav-fixed) for 5 s.
    await page.route('**/_astro/*.js', async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('nav-fixed')) await new Promise((resolve) => setTimeout(resolve, 5000));
      await route.fulfill({ response, body });
    });
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveClass(/\bmotion-ok\b/);
    await expect(page.locator('html')).not.toHaveClass(/\bmotion-ok\b/, { timeout: 4500 });
    expect(await hiddenReveals(page)).toEqual([]);
    // When it arrives late, the module sees that motion was withdrawn and does nothing.
    await page.waitForTimeout(2500);
    await expect(page.locator('html')).not.toHaveClass(/\bmotion-ready\b|\blenis\b/);
  });
});
