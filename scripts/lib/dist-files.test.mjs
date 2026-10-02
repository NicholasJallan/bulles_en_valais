import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { listFiles, pagePath } from './dist-files.mjs';

describe('listFiles', () => {
  let root = '';

  afterEach(async () => {
    if (root !== '') await rm(root, { recursive: true, force: true });
  });

  it('lists nested files with / separators, sorted, without directories', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'dist-files-'));
    await mkdir(path.join(root, 'en', 'privacy'), { recursive: true });
    await Promise.all(
      ['index.html', 'en/index.html', 'en/privacy/index.html', '404.html'].map((file) =>
        writeFile(path.join(root, file), ''),
      ),
    );
    expect(await listFiles(root)).toEqual([
      '404.html',
      'en/index.html',
      'en/privacy/index.html',
      'index.html',
    ]);
  });
});

describe('pagePath', () => {
  it('maps a file of dist/ to the URL path it is served at', () => {
    expect(pagePath('index.html')).toBe('/');
    expect(pagePath('en/index.html')).toBe('/en/');
    expect(pagePath('en/privacy/index.html')).toBe('/en/privacy/');
    expect(pagePath('404.html')).toBe('/404.html');
  });
});
