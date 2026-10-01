import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/en/',
  '/confidentialite/',
  '/mentions-legales/',
  '/en/privacy/',
  '/en/legal-notice/',
  '/404.html',
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING = new Set(['serious', 'critical']);

for (const path of PAGES) {
  test(`axe finds no serious or critical violation on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const blocking = violations
      .filter((violation) => BLOCKING.has(violation.impact ?? ''))
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.slice(0, 5).map((node) => node.target.join(' ')),
      }));
    expect(blocking).toEqual([]);
  });
}
