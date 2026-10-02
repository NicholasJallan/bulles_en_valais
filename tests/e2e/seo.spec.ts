import { expect, test } from '@playwright/test';

// Technical SEO of the built site (02-architecture.md §13). One browser is enough: nothing here
// depends on the engine.
test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'chromium only');

test('robots.txt allows everything and points to the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap: https://dive.bullesenvalais.ch/sitemap-index.xml');
});

test('llms.txt links both languages', async ({ request }) => {
  const text = await (await request.get('/llms.txt')).text();
  expect(text).toContain('https://dive.bullesenvalais.ch/');
  expect(text).toContain('https://dive.bullesenvalais.ch/en/');
});

test('the sitemap pairs every page with its translation', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).not.toContain('styleguide');
  expect(xml).toContain(
    '<xhtml:link rel="alternate" hreflang="en" href="https://dive.bullesenvalais.ch/en/privacy/"/>',
  );
});

for (const [path, locale, image] of [
  ['/', 'fr_CH', 'og-fr.jpg'],
  ['/en/', 'en_GB', 'og-en.jpg'],
] as const) {
  test(`${path} has its share card and valid JSON-LD`, async ({ page }) => {
    await page.goto(path);
    const meta = (property: string) =>
      page
        .locator(`meta[property="${property}"], meta[name="${property}"]`)
        .getAttribute('content');
    expect(await meta('og:locale')).toBe(locale);
    expect(await meta('og:image')).toBe(`https://dive.bullesenvalais.ch/og/${image}`);
    expect(await meta('twitter:card')).toBe('summary_large_image');
    expect(await meta('theme-color')).toMatch(/^#[0-9a-f]{6}$/);
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const graph = (JSON.parse(json ?? '') as { '@graph': { '@type': string }[] })['@graph'];
    expect(graph.map((node) => node['@type'])).toContain('LocalBusiness');
  });
}

test('the 404 page is not indexed', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});
