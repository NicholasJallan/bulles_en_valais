#!/usr/bin/env node
// @ts-check
// Publishes the redesign on the Pi next to the live site, for Nicholas to judge from his phone
// (D31, extended in S09): dist/_astro, dist/js and dist/styleguide at the root of the docroot,
// and every page of dist/ under /preview/ (links kept inside, noindex, no Google tag). The live
// index.html, en/ and api/ are never sent; --delete only cleans these four folders.
// Usage: npm run preview:pi            dry run (rsync -n), after a build
//        npm run preview:pi -- --apply  sends, then gives the folders to www-data
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { disableGoogleTag, rewriteForPreview } from './lib/preview-page.mjs';

const DIST = 'dist';
const HOST = 'pi@bullesenvalais.ch';
const DOCROOT = '/var/www/html/dive';
const PREFIX = '/preview/';
const SHARED = ['_astro', 'js', 'styleguide'];
/** Folders of dist/ that hold no page of the preview. */
const NOT_PAGES = new Set([...SHARED, 'api', 'og']);
const apply = process.argv.includes('--apply');

/** index.html of every page of dist/, relative to dist/. */
async function pages() {
  const entries = await readdir(DIST, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name === 'index.html')
    .map((entry) => path.relative(DIST, path.join(entry.parentPath, entry.name)))
    .filter((file) => !NOT_PAGES.has(file.split(path.sep)[0] ?? ''));
}

async function stage() {
  const root = await mkdtemp(path.join(tmpdir(), 'bev-preview-'));
  for (const folder of SHARED)
    await cp(path.join(DIST, folder), path.join(root, folder), { recursive: true });
  const consent = path.join(root, 'js', 'consent-default.js');
  await writeFile(consent, disableGoogleTag(await readFile(consent, 'utf8')));
  for (const page of await pages()) {
    const target = path.join(root, PREFIX.slice(1), page);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(
      target,
      rewriteForPreview(await readFile(path.join(DIST, page), 'utf8'), PREFIX),
    );
  }
  return root;
}

const root = await stage();
try {
  const folders = [...SHARED, PREFIX.slice(1, -1)];
  execFileSync(
    'rsync',
    [
      apply ? '-rltv' : '-rltvn',
      '--delete',
      '--omit-dir-times',
      '--rsync-path=sudo rsync',
      ...folders.map((folder) => `--include=/${folder}/***`),
      '--exclude=*',
      `${root}/`,
      `${HOST}:${DOCROOT}/`,
    ],
    { stdio: 'inherit' },
  );
  if (apply) {
    const owned = folders.map((folder) => `${DOCROOT}/${folder}`).join(' ');
    execFileSync('ssh', [HOST, `sudo chown -R www-data:www-data ${owned}`], { stdio: 'inherit' });
    console.info(`Preview: https://dive.bullesenvalais.ch${PREFIX}`);
  } else {
    console.info('Dry run: nothing sent. Again with --apply to publish.');
  }
} finally {
  await rm(root, { recursive: true, force: true });
}
