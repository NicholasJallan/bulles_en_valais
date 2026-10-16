import { expect, test } from '@playwright/test';
import { routePath } from '../../src/i18n/routes.ts';

test.describe('seasonal spotlight with JS', () => {
  test('selects baptism during summer (2026-07-15)', async ({ page }) => {
    await page.clock.setFixedTime('2026-07-15T12:00:00Z');
    await page.goto('/');
    const visibleSpotlights = page.locator('.hero-spotlight:visible');
    await expect(visibleSpotlights).toHaveCount(1);
    await expect(visibleSpotlights).toHaveAttribute('href', routePath('baptism', 'fr'));
  });

  test('selects drysuit during winter (2026-12-01)', async ({ page }) => {
    await page.clock.setFixedTime('2026-12-01T12:00:00Z');
    await page.goto('/');
    const visibleSpotlights = page.locator('.hero-spotlight:visible');
    await expect(visibleSpotlights).toHaveCount(1);
    await expect(visibleSpotlights).toHaveAttribute('href', routePath('drysuit', 'fr'));
  });
});

test.describe('seasonal spotlight without JS', () => {
  test.use({ javaScriptEnabled: false });

  test('renders exactly one visible spotlight at rest', async ({ page }) => {
    await page.goto('/');
    const visibleSpotlights = page.locator('.hero-spotlight:visible');
    await expect(visibleSpotlights).toHaveCount(1);
  });
});
