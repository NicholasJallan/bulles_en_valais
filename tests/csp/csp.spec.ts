import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from '../e2e/ready.ts';

// The whole visit under the production headers (scripts/serve-with-csp.mjs): not one CSP
// violation. The Google tag is not loaded off the production host, so its domains are checked in
// production (S13).

interface Violation {
  readonly directive: string;
  readonly blocked: string;
  readonly source: string;
}

async function watchViolations(page: Page): Promise<() => Promise<Violation[]>> {
  const fromConsole: string[] = [];
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) fromConsole.push(message.text());
  });
  await page.addInitScript(() => {
    // The banner hides itself from robots (navigator.webdriver): browse as a visitor.
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
    const seen: Violation[] = [];
    Object.defineProperty(window, '__cspViolations', { value: seen });
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
        source: `${event.sourceFile}:${event.lineNumber}`,
      });
    });
  });
  return async () => [
    ...(await page.evaluate(
      () => (window as unknown as { __cspViolations: Violation[] }).__cspViolations,
    )),
    ...fromConsole.map((text) => ({ directive: 'console', blocked: text, source: '' })),
  ];
}

/** Scrolls to the bottom in steps, so that every lazy image and script is requested. */
async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
  }
  await page.waitForLoadState('networkidle');
}

test('a full visit raises no CSP violation', async ({ page }) => {
  test.setTimeout(90_000);
  const violations = await watchViolations(page);
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );

  await gotoReady(page, '/');
  const banner = page.locator('#cc-main .cm');
  await banner.getByRole('button', { name: 'Tout accepter' }).click();
  await scrollThrough(page);

  await page.getByRole('tablist', { name: 'Choisir une école' }).getByRole('tab').nth(1).click();
  await page.locator('#faq summary').first().click();

  await page.locator('#contact-name').fill('Ana Test');
  await page.locator('#contact-email').fill('ana@example.ch');
  await page.locator('#contact-message').fill('Bonjour, un baptême en mai ?');
  await page.getByRole('button', { name: 'Envoyer le message' }).click();
  await expect(page.locator('[data-success]')).toBeVisible();

  await page.locator('.whatsapp-fab').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Gérer les cookies' }).click();
  await page.locator('#cc-main .pm').getByRole('button', { name: 'Tout refuser' }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await expect(page.locator('#site-menu')).toBeVisible();
  await page.keyboard.press('Escape');

  for (const path of ['/en/', '/confidentialite/', '/en/legal-notice/', '/introuvable/']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
  }

  expect(await violations()).toEqual([]);
});
