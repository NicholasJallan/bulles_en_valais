import { describe, expect, it } from 'vitest';
import { staticTarget } from './static-path.mjs';

const ROOT = '/srv/dist';
const isDirectory = (path) => ['/srv/dist', '/srv/dist/en', '/srv/dist/en/privacy'].includes(path);

describe('staticTarget', () => {
  it('serves index.html for a directory with its trailing slash', () => {
    expect(staticTarget(ROOT, '/', isDirectory)).toEqual({ file: '/srv/dist/index.html' });
    expect(staticTarget(ROOT, '/en/privacy/', isDirectory)).toEqual({
      file: '/srv/dist/en/privacy/index.html',
    });
  });

  it('redirects a directory without its trailing slash (trailingSlash: always)', () => {
    expect(staticTarget(ROOT, '/en', isDirectory)).toEqual({ redirect: '/en/' });
  });

  it('serves a file as is, decoded', () => {
    expect(staticTarget(ROOT, '/og/og%2Dfr.jpg', isDirectory)).toEqual({
      file: '/srv/dist/og/og-fr.jpg',
    });
  });

  it('never leaves the root', () => {
    for (const path of ['/../secret', '/%2e%2e/secret', '/en/../../etc/passwd', '/%00']) {
      expect(staticTarget(ROOT, path, isDirectory)).toEqual({ notFound: true });
    }
  });
});
