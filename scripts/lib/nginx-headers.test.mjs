import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cspDirectives, localHeaders, parseAddHeaders } from './nginx-headers.mjs';

const CONF = readFileSync(
  new URL('../../ops/nginx/security-headers.conf', import.meta.url),
  'utf8',
);

describe('parseAddHeaders', () => {
  it('reads the add_header lines and skips comments', () => {
    const text =
      '# add_header Ignored "x";\nadd_header X-A "1; b" always;\n  add_header X-B \'two\';\n';
    expect(parseAddHeaders(text)).toEqual([
      ['X-A', '1; b'],
      ['X-B', 'two'],
    ]);
  });

  it('refuses a line it cannot read rather than dropping a header', () => {
    expect(() => parseAddHeaders('add_header X-A unquoted always;')).toThrow(/line 1/);
  });
});

describe('ops/nginx/security-headers.conf', () => {
  const headers = new Map(parseAddHeaders(CONF));
  const csp = cspDirectives(headers.get('Content-Security-Policy') ?? '');

  it('keeps every security header of the live site', () => {
    expect([...headers.keys()]).toEqual([
      'Strict-Transport-Security',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Content-Security-Policy',
    ]);
  });

  it('allows no inline nor evaluated script, and no CDN', () => {
    expect(csp.get('script-src')).not.toContain("'unsafe-inline'");
    expect(csp.get('script-src')).not.toContain("'unsafe-eval'");
    expect(csp.has('script-src-elem')).toBe(false);
    expect(CONF).not.toMatch(/unpkg|fonts\.googleapis|fonts\.gstatic/);
  });

  it('locks down framing, plugins, base and forms', () => {
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('object-src')).toEqual(["'none'"]);
    expect(csp.get('base-uri')).toEqual(["'self'"]);
    expect(csp.get('form-action')).toEqual(["'self'"]);
    expect(csp.get('default-src')).toEqual(["'self'"]);
  });

  it('lets the Google tag reach GA4 and Ads (guide of 2026-09-18)', () => {
    expect(csp.get('script-src')).toContain('https://www.googletagmanager.com');
    for (const host of ['https://*.google-analytics.com', 'https://*.g.doubleclick.net']) {
      expect(csp.get('connect-src')).toContain(host);
      expect(csp.get('img-src')).toContain(host);
    }
  });
});

describe('localHeaders', () => {
  it('drops what only makes sense over HTTPS in production', () => {
    const local = new Map(localHeaders(parseAddHeaders(CONF)));
    expect(local.has('Strict-Transport-Security')).toBe(false);
    const csp = cspDirectives(local.get('Content-Security-Policy') ?? '');
    expect(csp.has('upgrade-insecure-requests')).toBe(false);
    expect(csp.get('script-src')).toEqual(
      cspDirectives(new Map(parseAddHeaders(CONF)).get('Content-Security-Policy') ?? '').get(
        'script-src',
      ),
    );
  });
});
