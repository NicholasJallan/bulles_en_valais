import { expect, test } from '@playwright/test';
import { getDictionary } from '../../src/i18n/index.ts';
import { alternates, routePath, type RouteId } from '../../src/i18n/routes.ts';
import type { Locale } from '../../src/i18n/types.ts';

const SITE = 'https://dive.bullesenvalais.ch';
const PAGES: ReadonlyArray<{ path: string; locale: Locale; lang: string; route: RouteId }> = [
  { path: '/', locale: 'fr', lang: 'fr-CH', route: 'home' },
  { path: '/en/', locale: 'en', lang: 'en', route: 'home' },
  { path: '/bapteme-plongee-valais/', locale: 'fr', lang: 'fr-CH', route: 'baptism' },
  { path: '/combinaison-etanche-valais/', locale: 'fr', lang: 'fr-CH', route: 'drysuit' },
  { path: '/cours-open-water-valais/', locale: 'fr', lang: 'fr-CH', route: 'openwater' },
  { path: '/en/try-scuba-diving-valais/', locale: 'en', lang: 'en', route: 'baptism' },
  { path: '/en/dry-suit-diving-valais/', locale: 'en', lang: 'en', route: 'drysuit' },
  { path: '/en/open-water-diver-valais/', locale: 'en', lang: 'en', route: 'openwater' },
];

for (const { path, locale, lang, route } of PAGES) {
  test.describe(`page ${path}`, () => {
    test('answers with its heading, in its language, without console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      if (route === 'home') {
        const { before, em, after } = getDictionary(locale).hero.title;
        // Astro 7 (compressHTML: 'jsx') drops implicit spaces around <em>: they must survive.
        await expect(heading).toHaveText([before, em, after].filter(Boolean).join(' '));
      } else {
        expect(await heading.textContent()).toBeTruthy();
      }
      await expect(page.locator('html')).toHaveClass(/\bjs\b/);
      expect(errors).toEqual([]);
    });

    test('declares its canonical URL and the hreflang alternates', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      for (const { hreflang, path: alternatePath } of alternates(route)) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute(
          'href',
          `${SITE}${alternatePath}`,
        );
      }
    });

    if (route === 'home') {
      test('footer contains links to the three course landing pages', async ({ page }) => {
        await page.goto(path);
        const footer = page.locator('footer.site-footer');
        await expect(footer.locator(`a[href="${routePath('baptism', locale)}"]`)).toBeVisible();
        await expect(footer.locator(`a[href="${routePath('drysuit', locale)}"]`)).toBeVisible();
        await expect(footer.locator(`a[href="${routePath('openwater', locale)}"]`)).toBeVisible();
      });
    }
  });
}
