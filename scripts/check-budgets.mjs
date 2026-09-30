#!/usr/bin/env node
// @ts-check
// Gzip budgets of the built site: initial JS and CSS of each page, total JS.
// Usage: npm run build && npm run check:budgets   (exit code 1 over budget)
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BUDGETS,
  evaluateBudgets,
  formatReport,
  gzipSize,
  measurePage,
} from './lib/budget-analysis.mjs';
import { listFiles, pagePath } from './lib/dist-files.mjs';

const JS_FILE = /\.m?js$/;

/**
 * @param {string} root
 * @returns {import('./lib/budget-analysis.mjs').DistReader}
 */
function createDistReader(root) {
  /** @type {Map<string, Promise<Buffer>>} */
  const cache = new Map();
  /** @param {string} urlPath */
  const load = (urlPath) => {
    const file = path.join(root, urlPath);
    if (!file.startsWith(root + path.sep)) throw new Error(`${urlPath} points outside ${root}`);
    const cached = cache.get(file) ?? readFile(file);
    cache.set(file, cached);
    return cached;
  };
  return {
    readText: async (urlPath) => (await load(urlPath)).toString('utf8'),
    sizeOf: async (urlPath) => gzipSize(await load(urlPath)),
  };
}

async function main() {
  const root = path.resolve(process.argv[2] ?? 'dist');
  if (!existsSync(root)) throw new Error(`${root} not found: run \`npm run build\` first`);

  const files = await listFiles(root);
  const reader = createDistReader(root);
  const pages = await Promise.all(
    files
      .filter((file) => file.endsWith('.html'))
      .map(async (file) =>
        measurePage(await readFile(path.join(root, file), 'utf8'), pagePath(file), reader),
      ),
  );
  const jsSizes = await Promise.all(
    files.filter((file) => JS_FILE.test(file)).map((file) => reader.sizeOf(`/${file}`)),
  );
  const report = {
    pages: pages.toSorted((a, b) => a.path.localeCompare(b.path)),
    totalJs: jsSizes.reduce((total, size) => total + size, 0),
  };

  console.log(formatReport(report, BUDGETS));
  const violations = evaluateBudgets(report, BUDGETS);
  if (violations.length > 0) {
    console.error(
      `\nOver budget:\n${violations.map((violation) => `  - ${violation}`).join('\n')}`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`check-budgets: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
