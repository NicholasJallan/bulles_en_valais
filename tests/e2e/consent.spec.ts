import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

// vanilla-cookieconsent hides itself from robots, navigator.webdriver included: these tests
// present the page as a person's browser would.
async function asVisitor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
  });
}

type Command = unknown[];

/** gtag calls queued in dataLayer, as arrays (gtag pushes its `arguments`). */
function consentCommands(page: Page, kind: 'default' | 'update'): Promise<Command[]> {
  return page.evaluate((wanted) => {
    const layer = (window as unknown as { dataLayer: ArrayLike<unknown>[] }).dataLayer;
    return layer
      .map((entry) => Array.from(entry))
      .filter((command) => command[0] === 'consent' && command[1] === wanted)
      .map((command) => JSON.parse(JSON.stringify(command)) as Command);
  }, kind);
}

const ALL = (value: 'granted' | 'denied') => ({
  ad_storage: value,
  ad_user_data: value,
  ad_personalization: value,
  analytics_storage: value,
});

const banner = (page: Page) => page.locator('#cc-main .cm');
const preferences = (page: Page) => page.locator('#cc-main .pm');

test.describe('consent', () => {
  test('denies everything by default and never loads the Google tag outside production', async ({
    page,
  }) => {
    const google: string[] = [];
    page.on('request', (request) => {
      if (/google|doubleclick/.test(new URL(request.url()).hostname)) google.push(request.url());
    });
    await gotoReady(page, '/');
    expect(await consentCommands(page, 'default')).toEqual([
      ['consent', 'default', { ...ALL('denied'), wait_for_update: 500 }],
    ]);
    expect(google).toEqual([]);
  });

  test('stays hidden from robots', async ({ page }) => {
    await gotoReady(page, '/');
    await expect(page.locator('#cc-main .cm')).toHaveCount(0);
  });

  test('« Tout accepter » grants every signal and hides the floating buttons meanwhile', async ({
    page,
  }) => {
    await asVisitor(page);
    await gotoReady(page, '/');
    await expect(banner(page)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-consent-open');
    await expect(page.locator('.whatsapp-fab')).toBeHidden();
    await banner(page).getByRole('button', { name: 'Tout accepter' }).click();
    await expect(banner(page)).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-consent-open');
    await expect(page.locator('.whatsapp-fab')).toBeVisible();
    expect(await consentCommands(page, 'update')).toEqual([['consent', 'update', ALL('granted')]]);
  });

  test('« Refuser » keeps every signal denied, and the choice applies before the banner loads on the next page', async ({
    page,
  }) => {
    await asVisitor(page);
    await gotoReady(page, '/en/');
    await banner(page).getByRole('button', { name: 'Reject all' }).click();
    expect(await consentCommands(page, 'update')).toEqual([['consent', 'update', ALL('denied')]]);
    await gotoReady(page, '/en/privacy/');
    await expect(banner(page)).toHaveCount(0);
    expect(await consentCommands(page, 'default')).toEqual([
      ['consent', 'default', { ...ALL('denied'), wait_for_update: 500 }],
    ]);
  });

  test('« Gérer les cookies » reopens the preferences and saves a partial choice', async ({
    page,
  }) => {
    await asVisitor(page);
    await gotoReady(page, '/');
    await banner(page).getByRole('button', { name: 'Tout accepter' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-controllers', 'ready');
    // The stored choice is the default of the next page, before the library loads.
    expect((await consentCommands(page, 'default'))[0]).toEqual([
      'consent',
      'default',
      { ...ALL('granted'), wait_for_update: 500 },
    ]);
    await page.getByRole('button', { name: 'Gérer les cookies' }).click();
    await expect(preferences(page)).toBeVisible();
    await preferences(page).getByRole('checkbox', { name: 'Publicité' }).uncheck({ force: true });
    await preferences(page).getByRole('button', { name: 'Enregistrer mes choix' }).click();
    await expect(preferences(page)).toBeHidden();
    const updates = await consentCommands(page, 'update');
    expect(updates.at(-1)).toEqual([
      'consent',
      'update',
      { ...ALL('denied'), analytics_storage: 'granted' },
    ]);
  });

  test('works with the keyboard, and Escape does not decide for the visitor', async ({ page }) => {
    await asVisitor(page);
    await gotoReady(page, '/');
    await expect(banner(page)).toBeVisible();
    const accept = banner(page).getByRole('button', { name: 'Tout accepter' });
    await accept.focus();
    await page.keyboard.press('Escape');
    await expect(banner(page)).toBeVisible();
    expect(await consentCommands(page, 'update')).toEqual([]);
    await banner(page).getByRole('button', { name: 'Choisir' }).focus();
    await page.keyboard.press('Enter');
    await expect(preferences(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(preferences(page)).toBeHidden();
    await expect(banner(page)).toBeVisible();
    expect(await consentCommands(page, 'update')).toEqual([]);
  });

  test('has no serious or critical axe violation while open', async ({ page }) => {
    await asVisitor(page);
    await gotoReady(page, '/');
    await expect(banner(page)).toBeVisible();
    // Contrast is measured once the opening transition is over.
    await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    const { violations } = await new AxeBuilder({ page })
      .include('#cc-main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
      .map((violation) => `${violation.id}: ${violation.nodes[0]?.target.join(' ')}`);
    expect(blocking).toEqual([]);
  });
});
