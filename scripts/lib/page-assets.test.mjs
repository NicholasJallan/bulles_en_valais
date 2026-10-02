import { describe, expect, it } from 'vitest';
import { extractPageAssets, resolveLocalPath } from './page-assets.mjs';

describe('extractPageAssets', () => {
  it('collects script sources, module preloads and script preloads', () => {
    const html = `<head>
      <script src="/js/boot.js"></script>
      <script type="module" src='/_astro/app.js'></script>
      <link rel="modulepreload" href="/_astro/chunk.js">
      <link href="/_astro/early.js" as="script" rel="preload">
      <script type="application/ld+json">{"@context":"https://schema.org"}</script>
      <script>inline()</script>
    </head>`;
    expect(extractPageAssets(html).scripts).toEqual([
      '/js/boot.js',
      '/_astro/app.js',
      '/_astro/chunk.js',
      '/_astro/early.js',
    ]);
  });

  it('collects stylesheets, with unquoted or upper-case attributes, and inline styles', () => {
    const html = `<LINK REL=Stylesheet HREF=/_astro/a.css><link rel="preload" as="font" href="/f.woff2">
      <link rel="stylesheet" href="/_astro/b.css"><style>body{margin:0}</style>`;
    const assets = extractPageAssets(html);
    expect(assets.stylesheets).toEqual(['/_astro/a.css', '/_astro/b.css']);
    expect(assets.inlineStyles).toEqual(['body{margin:0}']);
  });

  it('ignores tags inside HTML comments', () => {
    const html = '<!-- <script src="/old.js"></script> --><script src="/new.js"></script>';
    expect(extractPageAssets(html).scripts).toEqual(['/new.js']);
  });
});

describe('resolveLocalPath', () => {
  it('resolves absolute and relative references against the referrer', () => {
    expect(resolveLocalPath('/_astro/a.js', '/en/')).toBe('/_astro/a.js');
    expect(resolveLocalPath('./chunk.js', '/_astro/app.js')).toBe('/_astro/chunk.js');
    expect(resolveLocalPath('app.js', '/en/')).toBe('/en/app.js');
  });

  it('drops the query string and the fragment, and decodes the path', () => {
    expect(resolveLocalPath('/a%20b.js?v=1#x', '/')).toBe('/a b.js');
  });

  it('returns null for external resources', () => {
    expect(resolveLocalPath('https://www.googletagmanager.com/gtag/js?id=AW-1', '/')).toBeNull();
    expect(resolveLocalPath('//cdn.example.com/x.js', '/')).toBeNull();
    expect(resolveLocalPath('data:text/javascript,alert(1)', '/')).toBeNull();
  });
});
