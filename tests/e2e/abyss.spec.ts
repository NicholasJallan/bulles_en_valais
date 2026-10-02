// S09: the bottom of the dive and the start of the ascent — the lamp of the Specialties (E8) and
// the route of the Rhône in Places (E10).
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './ready.ts';

const isFine = (page: Page) =>
  page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);
const PLACES = {
  fr: ['Les Îles', 'Lac du Rosel', 'Léman'],
  en: ['Les Îles', 'Lac du Rosel', 'Lake Geneva'],
};

async function gotoMoving(page: Page, path = '/'): Promise<void> {
  await gotoReady(page, path);
  await expect(page.locator('html')).toHaveClass(/\bmotion-ready\b/);
}

/** The page has stopped scrolling (Lenis may still glide after a jump). */
async function scrollSettled(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const before = await page.evaluate(() => window.scrollY);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      return before === (await page.evaluate(() => window.scrollY));
    })
    .toBe(true);
}

/** No page wider than the screen. */
async function expectNoOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function expectPlaces(page: Page, names: readonly string[]): Promise<void> {
  const places = page.locator('#places .place');
  await expect(places.locator('.place-name')).toHaveText([...names]);
  await expect(places.locator('.place-facts')).toHaveCount(3);
  const links = places.locator('a.place-map-link');
  await expect(links).toHaveCount(3);
  for (const href of await links.evaluateAll((items) =>
    items.map((item) => item.getAttribute('href')),
  )) {
    expect(href).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=46\.\d+%2C[67]\./,
    );
  }
}

test.describe('specialties and places with motion', () => {
  test('the sites follow the Rhône, in French and in English', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await gotoMoving(page);
    await expectPlaces(page, PLACES.fr);
    await gotoMoving(page, '/en/');
    await expectPlaces(page, PLACES.en);
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
  });

  test('the lamp lights the card under the pointer, or the first card of a focused panel', async ({
    page,
  }) => {
    await gotoMoving(page);
    await expect(page.locator('#specialties .torch-beam')).toHaveCount(1);
    await expect(page.locator('#specialties .torch')).toHaveAttribute('aria-hidden', 'true');
    const cards = page.locator('#specialties [data-active] [data-torch-card]');
    if (await isFine(page)) {
      await cards.nth(2).scrollIntoViewIfNeeded();
      await scrollSettled(page);
      const box = await cards.nth(2).boundingBox();
      if (box === null) throw new Error('no card');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
      await expect(cards.nth(2)).toHaveClass(/\bis-lit\b/);
      await expect(page.locator('#specialties .is-lit')).toHaveCount(1);
    }
    await page.locator('#specialties [role="tab"][aria-selected="true"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Tab');
    await expect(page.locator('#specialties [role="tabpanel"][data-active]')).toBeFocused();
    await expect(cards.first()).toHaveClass(/\bis-lit\b/);
  });

  test('the places are pinned, the river is drawn and the keyboard brings each site into view', async ({
    page,
  }) => {
    await gotoMoving(page);
    // On every screen since S09: the map above the sites on a phone.
    await expect(page.locator('#places[data-pinned]')).toHaveCount(1);
    const drawn = () =>
      page
        .locator('[data-rhone-river]')
        .evaluate((path) => 1 - Number.parseFloat(getComputedStyle(path).strokeDashoffset));
    const links = page.locator('#places a.place-map-link');
    for (const [index, id] of ['sion', 'rosel', 'leman'].entries()) {
      await links.nth(index).focus();
      await expect(links.nth(index)).toBeFocused();
      // The card comes into the window (the scrub drifts behind the scroll), its station lights.
      await expect
        .poll(() =>
          page
            .locator('#places .place')
            .nth(index)
            .evaluate((card) => {
              const box = card.getBoundingClientRect();
              const view = card.closest('.places-window')?.getBoundingClientRect();
              return view !== undefined && box.left >= view.left - 1 && box.right <= view.right + 1;
            }),
        )
        .toBe(true);
      await expect(page.locator(`[data-station="${id}"]`)).toHaveAttribute('data-active', '');
    }
    await expect.poll(drawn).toBeGreaterThan(0.99);
    await expectNoOverflow(page);
    await expect(page.locator('.hud')).not.toHaveAttribute('data-mode', 'hidden');
  });
});

test('after a shorter specialties tab, the places still pin at the top of the screen', async ({
  page,
}) => {
  await gotoMoving(page);
  // TDI has 4 cards, SDI 10: the page above Places gets shorter.
  await page.locator('#specialties [role="tab"]').nth(1).click();
  await expect(page.locator('#specialties [role="tabpanel"][data-active]')).toHaveCount(1);
  const top = await page
    .locator('[data-places-stage]')
    .evaluate(
      (stage) => (stage.parentElement as HTMLElement).getBoundingClientRect().top + window.scrollY,
    );
  await page.evaluate((y) => window.scrollTo(0, y + 200), top);
  await expect
    .poll(() =>
      page.locator('[data-places-stage]').evaluate((stage) => stage.getBoundingClientRect().top),
    )
    .toBeCloseTo(0, 0);
});

test.describe('specialties and places with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no lamp, no pin: the places are static and the river whole', async ({ page }) => {
    await gotoReady(page, '/');
    await expectPlaces(page, PLACES.fr);
    await expect(page.locator('#specialties .torch')).toHaveCount(0);
    await expect(page.locator('#specialties .is-lit')).toHaveCount(0);
    await expect(page.locator('#places[data-pinned]')).toHaveCount(0);
    const offset = await page
      .locator('[data-rhone-river]')
      .evaluate((path) => getComputedStyle(path).strokeDasharray);
    expect(offset).toBe('none');
    await expectNoOverflow(page);
  });
});
