import { describe, expect, it } from 'vitest';
import {
  externalResources,
  forbiddenFiles,
  inlineScriptIssues,
  missingFiles,
} from './dist-analysis.mjs';

describe('inlineScriptIssues', () => {
  it('accepts script files and JSON-LD', () => {
    const html =
      '<script src="/js/boot.js"></script><script type="module" src="/_astro/app.js"></script>' +
      '<script type="application/ld+json">{"name":"<b>Bulles</b>"}</script><a href="/en/">EN</a>';
    expect(inlineScriptIssues(html)).toEqual([]);
  });

  it('reports inline scripts, whatever their type', () => {
    const html =
      '<script>boot()</script><script type="module">import"./x.js"</script>' +
      '<SCRIPT TYPE="text/javascript"></SCRIPT>';
    expect(inlineScriptIssues(html)).toEqual([
      'inline <script>',
      'inline <script type="module">',
      'inline <script type="text/javascript">',
    ]);
  });

  it('reports inline event handlers and javascript: URLs, in document order', () => {
    const html =
      '<body onload="init()"><a href=" JavaScript:void(0)">x</a>' +
      '<button type="button" onClick=go()>y</button></body>';
    expect(inlineScriptIssues(html)).toEqual([
      'inline handler onload',
      'javascript: URL in href',
      'inline handler onclick',
    ]);
  });

  it('ignores commented-out markup', () => {
    expect(inlineScriptIssues('<!-- <script>old()</script><a onclick="x()"> -->')).toEqual([]);
  });
});

describe('externalResources', () => {
  it('lists the scripts, script preloads and stylesheets of another origin', () => {
    const html =
      '<script src="https://unpkg.com/react.js"></script>' +
      '<script src="data:text/javascript,alert(1)"></script>' +
      '<link rel="modulepreload" href="//cdn.example.com/m.js">' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">';
    expect(externalResources(html)).toEqual([
      'https://unpkg.com/react.js',
      'data:text/javascript,alert(1)',
      '//cdn.example.com/m.js',
      'https://fonts.googleapis.com/css2?family=Inter',
    ]);
  });

  it('accepts local resources and ignores the links that load nothing', () => {
    const html =
      '<script src="/js/boot.js"></script><script type="module" src="/_astro/app.js"></script>' +
      '<link rel="stylesheet" href="/_astro/site.css">' +
      '<link rel="canonical" href="https://dive.bullesenvalais.ch/">' +
      '<link rel="alternate" hreflang="en" href="https://dive.bullesenvalais.ch/en/">';
    expect(externalResources(html)).toEqual([]);
  });
});

describe('missingFiles', () => {
  it('requires the contact endpoint', () => {
    expect(missingFiles(['index.html', 'api/contact.php'])).toEqual([]);
    expect(missingFiles(['index.html'])).toEqual(['api/contact.php']);
  });
});

describe('forbiddenFiles', () => {
  it('accepts the site files and the contact endpoint', () => {
    expect(
      forbiddenFiles(['index.html', 'en/index.html', '_astro/app.js', 'api/contact.php']),
    ).toEqual([]);
  });

  it('reports any other file under api/ and any other PHP file, whatever the case', () => {
    expect(
      forbiddenFiles([
        'api/contact.php',
        'api/mail-config.php',
        'api/notes.txt',
        'mail-config.php',
        'API/Secret.PHP',
      ]),
    ).toEqual(['api/mail-config.php', 'api/notes.txt', 'mail-config.php', 'API/Secret.PHP']);
  });

  it('reports hidden files (but .well-known/), keys and certificates, and local settings', () => {
    expect(
      forbiddenFiles([
        '.DS_Store',
        'og/.DS_Store',
        '.env',
        '.git/config',
        '.well-known/security.txt',
        'certs/site.pem',
        'private.KEY',
        'settings.json',
        'og/og-fr.jpg',
      ]),
    ).toEqual([
      '.DS_Store',
      'og/.DS_Store',
      '.env',
      '.git/config',
      'certs/site.pem',
      'private.KEY',
      'settings.json',
    ]);
  });
});
