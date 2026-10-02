import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

async function fillForm(page: Page): Promise<void> {
  await page.locator('#contact-name').fill('Ana Test');
  await page.locator('#contact-email').fill('ana@example.ch');
  await page.locator('#contact-message').fill('Bonjour, un baptême en mai ?');
}

function mockContact(page: Page, status: number, body: unknown) {
  const requests: unknown[] = [];
  return page
    .route('**/api/contact', async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    })
    .then(() => requests);
}

const submit = (page: Page) => page.getByRole('button', { name: 'Envoyer le message' }).click();

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/#contact');
  });

  test('checks the fields before sending and focuses the summary', async ({ page }) => {
    const requests = await mockContact(page, 200, { ok: true });
    await page.locator('#contact-email').fill('pas-une-adresse');
    await submit(page);
    const summary = page.locator('[data-summary]');
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveText(['le nom', 'l’adresse e-mail']);
    await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-name')).toHaveAttribute(
      'aria-describedby',
      /contact-name-error/,
    );
    await expect(page.locator('#contact-name-error')).toHaveText('Ce champ est obligatoire.');
    expect(requests).toEqual([]);
  });

  test('validates a field when leaving it', async ({ page }) => {
    await page.locator('#contact-email').fill('nope');
    await page.locator('#contact-phone').focus();
    await expect(page.locator('#contact-email-error')).toBeVisible();
    await page.locator('#contact-email').fill('ana@example.ch');
    await page.locator('#contact-phone').focus();
    await expect(page.locator('#contact-email-error')).toBeHidden();
    await expect(page.locator('#contact-email')).not.toHaveAttribute('aria-invalid');
  });

  test('200: shows the success message and sends the expected JSON', async ({ page }) => {
    const requests = await mockContact(page, 200, { ok: true });
    await fillForm(page);
    await submit(page);
    const success = page.locator('[data-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    expect(requests).toEqual([
      expect.objectContaining({
        name: 'Ana Test',
        email: 'ana@example.ch',
        interest: 'sdi-owd',
        website: '',
        locale: 'fr',
        elapsed: expect.any(Number),
      }),
    ]);
  });

  test('200 with motion: a burst of bubbles rises from the button', async ({ page }) => {
    const moving = await page.evaluate(() =>
      document.documentElement.classList.contains('motion-ready'),
    );
    test.skip(!moving, 'no bubbles without the motion module');
    await mockContact(page, 200, { ok: true });
    await fillForm(page);
    await submit(page);
    await expect(page.locator('[data-success]')).toBeVisible();
    await expect(page.locator('canvas.bubbles-canvas')).toHaveCount(1);
  });

  test('429: asks to wait a minute, with the alternatives', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 429, contentType: 'text/html', body: '<html>429</html>' }),
    );
    await fillForm(page);
    await submit(page);
    const failure = page.locator('[data-failure]');
    await expect(failure).toBeFocused();
    await expect(failure).toContainText('Réessayez dans une minute');
    await expect(
      failure.getByRole('link', { name: 'Envoyer mon message par e-mail' }),
    ).toBeVisible();
  });

  test('503 busy: the daily limit points to the direct channels', async ({ page }) => {
    await mockContact(page, 503, { ok: false, error: 'busy' });
    await fillForm(page);
    await submit(page);
    const failure = page.locator('[data-failure]');
    await expect(failure).toContainText('fait une pause');
    await expect(failure.getByRole('link', { name: /Écrire sur WhatsApp/ })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/41794368112\?text=Bonjour/,
    );
  });

  test('400: marks the fields the server refused and offers the alternatives', async ({ page }) => {
    await mockContact(page, 400, { ok: false, error: 'validation', fields: ['email'] });
    await fillForm(page);
    await submit(page);
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('[data-failure]')).toBeVisible();
  });

  test('500: offers the alternatives without leaving the page', async ({ page, context }) => {
    await mockContact(page, 500, { ok: false, error: 'delivery' });
    const url = page.url();
    let popups = 0;
    context.on('page', () => (popups += 1));
    await fillForm(page);
    await submit(page);
    const failure = page.locator('[data-failure]');
    await expect(failure).toBeVisible();
    await expect(failure).toBeFocused();
    const mailto = failure.getByRole('link', { name: 'Envoyer mon message par e-mail' });
    await expect(mailto).toHaveAttribute(
      'href',
      /^mailto:nicholas@bullesenvalais\.ch\?subject=.+&body=Bonjour/,
    );
    await expect(failure.getByRole('link', { name: /Écrire sur WhatsApp/ })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/41794368112\?text=Bonjour/,
    );
    expect(page.url()).toBe(url);
    expect(popups).toBe(0);
    await expect(page.getByRole('button', { name: 'Envoyer le message' })).toBeEnabled();
  });
});
