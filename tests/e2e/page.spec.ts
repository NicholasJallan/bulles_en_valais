import { expect, test } from '@playwright/test';
import { HISTORICAL_ANCHORS } from '../../src/data/sections.ts';
import { getDictionary } from '../../src/i18n/index.ts';

/** String leaves of a value, with their path: `hero.lead`, `faq.items.0.answer`… */
function leaves(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, path === '' ? key : `${path}.${key}`),
  );
}

// French texts that differ from their English version (the legal pages are other pages).
const { legal: _frLegal, ...frHome } = getDictionary('fr');
const enLeaves = new Map(leaves(getDictionary('en')));
const FRENCH_ONLY = leaves(frHome)
  .filter(([path, text]) => text.length >= 12 && enLeaves.get(path) !== text)
  .map(([, text]) => text);

test.describe('home page', () => {
  for (const path of ['/', '/en/']) {
    test(`keeps the historical anchors (${path})`, async ({ page }) => {
      await page.goto(path);
      for (const anchor of HISTORICAL_ANCHORS) {
        await expect(page.locator(`[id="${anchor}"]`), anchor).toHaveCount(1);
      }
    });
  }

  test('has one h1 and one labelled section per h2', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    for (const section of await page.locator('main section[aria-labelledby]').all()) {
      const id = await section.getAttribute('aria-labelledby');
      await expect(section.locator(`[id="${id}"]`)).toHaveCount(1);
    }
  });

  test('switches language with real links', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'anglais' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('footer').getByRole('link', { name: 'French' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CH');
  });

  test('is entirely in English on /en/', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('[lang^="fr"]')).toHaveCount(0);
    const text = await page.locator('body').textContent();
    expect(FRENCH_ONLY.length).toBeGreaterThan(100);
    expect(FRENCH_ONLY.filter((french) => text?.includes(french))).toEqual([]);
    expect(text).toContain(getDictionary('en').hero.lead);
  });
});
