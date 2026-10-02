import { expect, test } from '@playwright/test';

const PAGES = ['/', '/en/', '/confidentialite/', '/en/legal-notice/', '/404.html'];

test.use({ viewport: { width: 320, height: 640 } });

for (const path of PAGES) {
  test(`no horizontal scroll at 320 px on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}
