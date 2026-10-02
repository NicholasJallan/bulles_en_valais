// @ts-check
// Pure helpers of scripts/check-budgets.mjs: file access is injected (DistReader).
import { gzipSync } from 'node:zlib';
import { init, parse } from 'es-module-lexer';
import { extractPageAssets, resolveLocalPath } from './page-assets.mjs';

export const KB = 1024;

/** @typedef {{ initialJs: number, totalJs: number, css: number }} Budgets */
/** @typedef {{ path: string, initialJs: number, css: number }} PageMeasure */
/** @typedef {{ pages: readonly PageMeasure[], totalJs: number }} Report */
/**
 * Reads dist/ by URL path (`/_astro/app.js`); both functions reject for a missing file.
 * @typedef {{ readText: (urlPath: string) => Promise<string>, sizeOf: (urlPath: string) => Promise<number> }} DistReader
 */

/** @type {Readonly<Budgets>} */
export const BUDGETS = Object.freeze({ initialJs: 90 * KB, totalJs: 150 * KB, css: 30 * KB });

/**
 * Specifiers of the static imports and re-exports of a module (not `import()`).
 * @param {string} code
 */
export async function staticImports(code) {
  await init;
  const [imports] = parse(code);
  return imports.flatMap((entry) => (entry.d === -1 && entry.n !== undefined ? [entry.n] : []));
}

/**
 * Every module loaded with the entries: the entries and their static imports, recursively.
 * @param {readonly string[]} entries URL paths
 * @param {DistReader['readText']} readText
 */
export async function jsClosure(entries, readText) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length > 0) {
    const current = /** @type {string} */ (queue.shift());
    if (seen.has(current)) continue;
    seen.add(current);
    for (const specifier of await staticImports(await readText(current))) {
      const resolved = resolveLocalPath(specifier, current);
      if (resolved !== null) queue.push(resolved);
    }
  }
  return [...seen];
}

/** @param {string | Uint8Array} content */
export function gzipSize(content) {
  return gzipSync(content).length;
}

/**
 * @param {readonly string[]} urlPaths
 * @param {DistReader['sizeOf']} sizeOf
 */
async function totalSize(urlPaths, sizeOf) {
  const sizes = await Promise.all(urlPaths.map((urlPath) => sizeOf(urlPath)));
  return sizes.reduce((total, size) => total + size, 0);
}

/**
 * Gzip sizes a first visit of the page downloads: initial JS and CSS.
 * @param {string} html
 * @param {string} path URL path of the page
 * @param {DistReader} reader
 * @returns {Promise<PageMeasure>}
 */
export async function measurePage(html, path, reader) {
  const assets = extractPageAssets(html);
  /** @param {readonly string[]} references */
  const local = (references) => [
    ...new Set(
      references
        .map((reference) => resolveLocalPath(reference, path))
        .filter((resolved) => resolved !== null),
    ),
  ];
  const scripts = await jsClosure(local(assets.scripts), reader.readText);
  const inlineCss = assets.inlineStyles.reduce((total, css) => total + gzipSize(css), 0);
  return {
    path,
    initialJs: await totalSize(scripts, reader.sizeOf),
    css: (await totalSize(local(assets.stylesheets), reader.sizeOf)) + inlineCss,
  };
}

/** @param {number} bytes */
export function formatKB(bytes) {
  return `${(bytes / KB).toFixed(1)} KB`;
}

/**
 * @param {Report} report
 * @param {Budgets} budgets
 * @returns {string[]} one message per exceeded budget
 */
export function evaluateBudgets(report, budgets) {
  /** @type {(label: string, size: number, limit: number) => string[]} */
  const over = (label, size, limit) =>
    size > limit ? [`${label} ${formatKB(size)} > ${formatKB(limit)}`] : [];
  return [
    ...report.pages.flatMap((page) => [
      ...over(`${page.path}: initial JS`, page.initialJs, budgets.initialJs),
      ...over(`${page.path}: CSS`, page.css, budgets.css),
    ]),
    ...over('total JS', report.totalJs, budgets.totalJs),
  ];
}

/**
 * @param {Report} report
 * @param {Budgets} budgets
 */
export function formatReport(report, budgets) {
  const TOTAL_LABEL = 'Total JS';
  const CELL_WIDTH = 12;
  const rows = [
    ['Page', 'Initial JS', 'CSS'],
    ...report.pages.map((page) => [page.path, formatKB(page.initialJs), formatKB(page.css)]),
  ];
  const labelWidth = Math.max(TOTAL_LABEL.length, ...rows.map(([label]) => label.length));
  /** @param {string[]} cells */
  const line = ([label, ...values]) =>
    label.padEnd(labelWidth) + values.map((value) => value.padStart(CELL_WIDTH)).join('');
  return [
    'Gzip sizes (level 6, 1 KB = 1024 bytes)',
    ...rows.map(line),
    line([TOTAL_LABEL, formatKB(report.totalJs)]),
    `Budgets: initial JS ≤ ${formatKB(budgets.initialJs)} per page · CSS ≤ ${formatKB(budgets.css)} per page · total JS ≤ ${formatKB(budgets.totalJs)}`,
  ].join('\n');
}
