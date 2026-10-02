import { describe, expect, it } from 'vitest';
import {
  evaluateBudgets,
  formatKB,
  formatReport,
  gzipSize,
  jsClosure,
  KB,
  measurePage,
  staticImports,
} from './budget-analysis.mjs';

const BUDGETS = { initialJs: 90 * KB, totalJs: 150 * KB, css: 30 * KB };

/** In-memory dist: url path → { text, size }. */
function fakeDist(files) {
  const lookup = (urlPath) => {
    if (!Object.hasOwn(files, urlPath)) throw new Error(`missing ${urlPath}`);
    return files[urlPath];
  };
  return {
    readText: async (urlPath) => lookup(urlPath).text ?? '',
    sizeOf: async (urlPath) => lookup(urlPath).size,
  };
}

describe('staticImports', () => {
  it('lists static imports and re-exports, not dynamic imports', async () => {
    const code =
      'import"./a.js";import{b as c}from"./b.js";export*from"./c.js";' +
      'const d=()=>import("./lazy.js");console.log(import.meta.url,c,d);';
    expect(await staticImports(code)).toEqual(['./a.js', './b.js', './c.js']);
  });
});

describe('jsClosure', () => {
  it('follows static imports only, once per file, and skips external modules', async () => {
    const { readText } = fakeDist({
      '/_astro/entry.js': {
        text: 'import"./shared.js";import"https://cdn.example.com/x.js";import("./lazy.js")',
      },
      '/_astro/shared.js': { text: 'import"./entry.js";export const x=1;' },
    });
    expect(await jsClosure(['/_astro/entry.js', '/_astro/entry.js'], readText)).toEqual([
      '/_astro/entry.js',
      '/_astro/shared.js',
    ]);
  });
});

describe('measurePage', () => {
  it('sums the static JS graph and the CSS of a page', async () => {
    const html =
      '<script src="/js/boot.js"></script><script type="module" src="/_astro/app.js"></script>' +
      '<link rel="stylesheet" href="/_astro/site.css"><style>a{color:red}</style>';
    const io = fakeDist({
      '/js/boot.js': { size: 100 },
      '/_astro/app.js': { text: 'import"./shared.js";import("./lazy.js")', size: 200 },
      '/_astro/shared.js': { size: 50 },
      '/_astro/lazy.js': { size: 1000 },
      '/_astro/site.css': { size: 300 },
    });
    expect(await measurePage(html, '/en/', io)).toEqual({
      path: '/en/',
      initialJs: 350,
      css: 300 + gzipSize('a{color:red}'),
    });
  });

  it('fails when a referenced file is missing', async () => {
    const io = fakeDist({});
    await expect(measurePage('<script src="/gone.js"></script>', '/', io)).rejects.toThrow(
      /missing \/gone\.js/,
    );
  });
});

describe('evaluateBudgets', () => {
  it('accepts sizes equal to the budgets', () => {
    const report = { pages: [{ path: '/', initialJs: 90 * KB, css: 30 * KB }], totalJs: 150 * KB };
    expect(evaluateBudgets(report, BUDGETS)).toEqual([]);
  });

  it('reports every exceeded budget', () => {
    const report = {
      pages: [
        { path: '/', initialJs: 91 * KB, css: 10 * KB },
        { path: '/en/', initialJs: 10 * KB, css: 31 * KB },
      ],
      totalJs: 151 * KB,
    };
    expect(evaluateBudgets(report, BUDGETS)).toEqual([
      '/: initial JS 91.0 KB > 90.0 KB',
      '/en/: CSS 31.0 KB > 30.0 KB',
      'total JS 151.0 KB > 150.0 KB',
    ]);
  });
});

describe('formatKB', () => {
  it('prints kilobytes with one decimal', () => {
    expect(formatKB(0)).toBe('0.0 KB');
    expect(formatKB(1536)).toBe('1.5 KB');
  });
});

describe('formatReport', () => {
  it('prints one row per page, the total and the budgets', () => {
    const report = {
      pages: [
        { path: '/', initialJs: 1 * KB, css: 2 * KB },
        { path: '/en/', initialJs: 1 * KB, css: 2 * KB },
      ],
      totalJs: 3 * KB,
    };
    const text = formatReport(report, BUDGETS);
    expect(text).toMatch(/^\/\s+1\.0 KB\s+2\.0 KB$/m);
    expect(text).toMatch(/^\/en\/\s+1\.0 KB\s+2\.0 KB$/m);
    expect(text).toMatch(/^Total JS\s+3\.0 KB$/m);
    expect(text).toContain('initial JS ≤ 90.0 KB per page');
    expect(text).toContain('CSS ≤ 30.0 KB per page');
    expect(text).toContain('total JS ≤ 150.0 KB');
  });
});
