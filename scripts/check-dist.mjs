#!/usr/bin/env node
// @ts-check
// Checks dist/ for what the target CSP and the server forbid: inline JavaScript,
// resources of another origin, files that must not be published (secrets, stray
// PHP) and a missing contact endpoint. Run by `npm run build`.
// Usage: npm run check:dist   (exit code 1 on a violation)
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  externalResources,
  forbiddenFiles,
  inlineScriptIssues,
  missingFiles,
} from './lib/dist-analysis.mjs';
import { listFiles, pagePath } from './lib/dist-files.mjs';

const MAX_REFERENCE_LENGTH = 80;

/** @param {string} reference */
function shorten(reference) {
  return reference.length > MAX_REFERENCE_LENGTH
    ? `${reference.slice(0, MAX_REFERENCE_LENGTH)}…`
    : reference;
}

/**
 * @param {string} root
 * @param {string} file HTML file relative to root
 */
async function pageIssues(root, file) {
  const html = await readFile(path.join(root, file), 'utf8');
  const issues = [
    ...inlineScriptIssues(html),
    ...externalResources(html).map((reference) => `external resource ${shorten(reference)}`),
  ];
  return issues.map((issue) => `${pagePath(file)}: ${issue}`);
}

async function main() {
  const root = path.resolve(process.argv[2] ?? 'dist');
  if (!existsSync(root)) throw new Error(`${root} not found: run \`npm run build\` first`);

  const files = await listFiles(root);
  const pages = files.filter((file) => file.endsWith('.html'));
  const issues = [
    ...(await Promise.all(pages.map((file) => pageIssues(root, file)))).flat(),
    ...forbiddenFiles(files).map((file) => `${file}: must not be published`),
    ...missingFiles(files).map((file) => `${file}: missing`),
  ];

  if (issues.length > 0) {
    console.error(`dist/ check failed:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `dist/ check passed: ${pages.length} pages without inline JavaScript or external resources; ` +
      'api/contact.php present, no hidden, secret or stray PHP file',
  );
}

main().catch((error) => {
  console.error(`check-dist: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
