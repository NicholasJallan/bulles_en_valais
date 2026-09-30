import { expect, test } from '@playwright/test';
import { getDictionary } from '../../src/i18n/index.ts';
import type { Locale } from '../../src/i18n/types.ts';

const SITE = 'https://dive.bullesenvalais.ch';
const PAGES: ReadonlyArray<{ path: string; locale: Locale; lang: string }> = [
  { path: '/', locale: 'fr', lang: 'fr-CH' },
  { path: '/en/', locale: 'en', lang: 'en' },
];
const ALTERNATES = [
  { hreflang: 'fr-CH', href: `${SITE}/` },
  { hreflang: 'en', href: `${SITE}/en/` },
  { hreflang: 'x-default', href: `${SITE}/` },
];

for (const { path, locale, lang } of PAGES) {
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

      const { before, em, after } = getDictionary(locale).hero.title;
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      // Astro 7 (compressHTML: 'jsx') drops implicit spaces around <em>: they must survive.
      await expect(heading).toHaveText([before, em, after].filter(Boolean).join(' '));
      await expect(page.locator('html')).toHaveClass(/\bjs\b/);
      expect(errors).toEqual([]);
    });

    test('declares its canonical URL and the hreflang alternates', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      for (const { hreflang, href } of ALTERNATES) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute(
          'href',
          href,
        );
      }
    });
  });
}
