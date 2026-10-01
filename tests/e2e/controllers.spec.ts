import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 1024;

test.describe('essential controllers', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/');
  });

  test('courses tabs follow the APG keyboard model', async ({ page }) => {
    const tablist = page.getByRole('tablist', { name: 'Choisir une école' });
    const tabs = tablist.getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(0)).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#agency-padi')).toBeVisible();
    await expect(page.locator('#agency-sdi-tdi')).toBeHidden();
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.locator('#agency-sdi-tdi')).toBeVisible();
  });

  test('specialty tabs switch on click', async ({ page }) => {
    await page.getByRole('tab', { name: 'FFESSM' }).last().click();
    await expect(page.locator('#specialties-ffessm')).toBeVisible();
    await expect(page.locator('#specialties-sdi')).toBeHidden();
  });

  test('FAQ keeps one answer open at a time', async ({ page }) => {
    const items = page.locator('#faq details');
    await items.nth(0).locator('summary').click();
    await expect(items.nth(0)).toHaveAttribute('open', '');
    await items.nth(1).locator('summary').click();
    await expect(items.nth(1)).toHaveAttribute('open', '');
    await expect(items.nth(0)).not.toHaveAttribute('open');
  });

  test('the gift voucher link selects the gift interest', async ({ page }) => {
    await page.getByRole('link', { name: 'Offrir un bon cadeau' }).click();
    await expect(page).toHaveURL(/#contact-form$/);
    await expect(page.locator('#contact-interest')).toHaveValue('gift');
  });

  test('the WhatsApp dialog traps the focus, closes on Escape and gives the focus back', async ({
    page,
  }) => {
    const opener = page.getByRole('link', { name: 'Discuter sur WhatsApp' });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Discuter avec Nicholas' });
    await expect(dialog).toBeVisible();
    await page.locator('#whatsapp-message').fill('Bonjour, une question');
    const send = dialog.getByRole('link', { name: /Envoyer sur WhatsApp/ });
    await expect(send).toHaveAttribute(
      'href',
      'https://wa.me/41794368112?text=Bonjour%2C%20une%20question',
    );
    await expect(send).toHaveAttribute('rel', 'noopener noreferrer');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('the mobile menu is a modal dialog', async ({ page }) => {
    test.skip(!isMobile(page), 'the menu only exists below 1024 px');
    const button = page.getByRole('button', { name: 'Ouvrir le menu' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#site-menu');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await menu.getByRole('link', { name: 'FAQ' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.locator('#faq-title')).toBeFocused();
  });

  test('calm mode is remembered and stops the motion classes', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Mode calme' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await Promise.all([page.waitForEvent('load'), toggle.click()]);
    await expect(page.getByRole('button', { name: 'Mode calme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('html')).not.toHaveClass(/motion-ok/);
    expect(await page.evaluate(() => localStorage.getItem('bv-calm'))).toBe('1');
  });
});
