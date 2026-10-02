// @ts-check
// Walking the built site, shared by the checks of dist/.
import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Every file under `root`, relative to it, with `/` separators, sorted.
 * @param {string} root
 */
export async function listFiles(root) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'),
    )
    .sort();
}

/**
 * URL path a file of dist/ is served at (`en/index.html` → `/en/`).
 * @param {string} file relative to dist/, with `/` separators
 */
export function pagePath(file) {
  return `/${file.replace(/(^|\/)index\.html$/, '$1')}`;
}
