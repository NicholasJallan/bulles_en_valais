import { expect, test } from '@playwright/test';
import { gotoReady } from './ready.ts';

const SUBPAGES = [
  '/bapteme-plongee-valais/',
  '/combinaison-etanche-valais/',
  '/cours-open-water-valais/',
  '/en/try-scuba-diving-valais/',
  '/en/dry-suit-diving-valais/',
  '/en/open-water-diver-valais/',
  '/mentions-legales/',
  '/en/privacy/',
] as const;

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844 },
  { name: '1440x900', width: 1440, height: 900 },
] as const;

test.describe('masthead layout and scale', () => {
  for (const { name: vpName, width, height } of VIEWPORTS) {
    test.describe(`at ${vpName}`, () => {
      test.use({ viewport: { width, height } });

      for (const path of SUBPAGES) {
        test(`on ${path}, .site-header has no has-hero and logo does not overlap h1`, async ({
          page,
        }) => {
          await page.goto(path);
          const header = page.locator('.site-header');
          await expect(header).toBeVisible();
          await expect(header).not.toHaveClass(/\bhas-hero\b/);

          const logo = page.locator('.site-header .brand-logo');
          const heading = page.locator('h1');
          await expect(logo).toBeVisible();
          await expect(heading).toBeVisible();

          const logoBox = await logo.boundingBox();
          const headingBox = await heading.boundingBox();
          expect(logoBox).not.toBeNull();
          expect(headingBox).not.toBeNull();

          const overlaps =
            logoBox!.x < headingBox!.x + headingBox!.width &&
            logoBox!.x + logoBox!.width > headingBox!.x &&
            logoBox!.y < headingBox!.y + headingBox!.height &&
            logoBox!.y + logoBox!.height > headingBox!.y;

          expect(
            overlaps,
            `Logo (${JSON.stringify(logoBox)}) overlaps H1 (${JSON.stringify(headingBox)}) on ${path} at ${vpName}`,
          ).toBe(false);
        });
      }
    });
  }

  test('on "/", .site-header has has-hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.site-header')).toHaveClass(/\bhas-hero\b/);
  });

  test('on a landing page with motion allowed, html has nav-fixed and .site-header gets is-glass after scrolling past #top', async ({
    page,
  }) => {
    await gotoReady(page, '/bapteme-plongee-valais/');
    await expect(page.locator('html')).toHaveClass(/\bnav-fixed\b/);

    const header = page.locator('.site-header');
    await expect(header).not.toHaveClass(/\bis-glass\b/);

    await page.evaluate(() => {
      const top = document.getElementById('top');
      if (top) {
        window.scrollTo(0, top.offsetTop + top.offsetHeight + 100);
      } else {
        window.scrollTo(0, 1500);
      }
    });

    await expect(header).toHaveClass(/\bis-glass\b/);
  });
});
