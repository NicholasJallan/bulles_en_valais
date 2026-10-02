import { describe, expect, it } from 'vitest';
import { disableGoogleTag, rewriteForPreview } from './preview-page.mjs';

describe('rewriteForPreview', () => {
  const page = [
    '<html lang="fr"><head><meta charset="utf-8"><title>T</title>',
    '<link rel="canonical" href="https://dive.bullesenvalais.ch/">',
    '<link rel="stylesheet" href="/_astro/index.css"><script src="/js/boot.js"></script>',
    '<link rel="icon" href="/favicon.svg"></head><body>',
    '<a href="/">Logo</a><a href="/en/">EN</a><a href="/#contact">Contact</a>',
    '<a href="/confidentialite/">Confidentialité</a><a href="#faq">FAQ</a>',
    '<a href="https://wa.me/41794368112">WhatsApp</a></body></html>',
  ].join('');
  const preview = rewriteForPreview(page, '/preview/');

  it('keeps the pages of the preview among themselves', () => {
    expect(preview).toContain('<a href="/preview/">Logo</a>');
    expect(preview).toContain('<a href="/preview/en/">EN</a>');
    expect(preview).toContain('<a href="/preview/#contact">Contact</a>');
    expect(preview).toContain('<a href="/preview/confidentialite/">');
  });

  it('leaves the assets, the same-page anchors and the other sites alone', () => {
    expect(preview).toContain('href="/_astro/index.css"');
    expect(preview).toContain('src="/js/boot.js"');
    expect(preview).toContain('href="/favicon.svg"');
    expect(preview).toContain('href="#faq"');
    expect(preview).toContain('href="https://wa.me/41794368112"');
    expect(preview).toContain('href="https://dive.bullesenvalais.ch/"');
  });

  it('keeps search engines away', () => {
    expect(preview).toMatch(/<head><meta name="robots" content="noindex, nofollow">/);
    const indexed = '<head><meta name="robots" content="index"></head>';
    expect(rewriteForPreview(indexed, '/preview/')).toBe(
      '<head><meta name="robots" content="noindex, nofollow"></head>',
    );
  });

  it('refuses a prefix that is not a folder', () => {
    expect(() => rewriteForPreview(page, 'preview')).toThrow(RangeError);
  });
});

describe('disableGoogleTag', () => {
  it('points the production host of consent-default.js elsewhere', () => {
    const script = "  var PRODUCTION_HOST = 'dive.bullesenvalais.ch';\n";
    expect(disableGoogleTag(script)).toBe("  var PRODUCTION_HOST = 'preview.invalid';\n");
  });

  it('fails loudly when the host is not found', () => {
    expect(() => disableGoogleTag('var x = 1;')).toThrow(/PRODUCTION_HOST/);
  });
});
