import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test.describe('without JavaScript', () => {
  test('every panel is readable and the direct channels are offered', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
    await expect(page.getByRole('tablist')).toHaveCount(0);
    for (const id of ['#agency-sdi-tdi', '#agency-padi', '#agency-ffessm', '#specialties-ffessm']) {
      await expect(page.locator(id)).toBeVisible();
    }
    await expect(
      page
        .locator('nav[aria-label="Navigation principale"]')
        .first()
        .getByRole('link', { name: 'FAQ' }),
    ).toBeVisible();
    await expect(page.getByText('Sans JavaScript, ce formulaire ne peut pas partir')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Envoyer le message' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Discuter sur WhatsApp' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\//,
    );
  });

  test('the FAQ still opens', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('#faq details').first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
  });
});
