// Reads the add_header lines of ops/nginx/security-headers.conf, so that the local CSP server
// (scripts/serve-with-csp.mjs) sends exactly what nginx will send.

const ADD_HEADER = /^add_header\s+([A-Za-z-]+)\s+(?:"([^"]*)"|'([^']*)')(?:\s+always)?\s*;$/;

/**
 * `[name, value]` of every add_header line; comments and other directives are skipped.
 * @param {string} text
 * @returns {Array<[string, string]>}
 */
export function parseAddHeaders(text) {
  return text.split('\n').flatMap((raw, index) => {
    const line = raw.trim();
    if (!line.startsWith('add_header')) return [];
    const match = ADD_HEADER.exec(line);
    if (match === null) throw new Error(`Unreadable add_header on line ${index + 1}: ${line}`);
    return [[match[1], match[2] ?? match[3]]];
  });
}

/**
 * Directives of a CSP, by name.
 * @param {string} policy
 * @returns {Map<string, string[]>}
 */
export function cspDirectives(policy) {
  return new Map(
    policy
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name !== '')
      .map(([name, ...sources]) => [name, sources]),
  );
}

/**
 * Headers for http://localhost: no HSTS, and no upgrade-insecure-requests (it would send the
 * page's own requests to https://localhost). Everything else is unchanged.
 * @param {Array<[string, string]>} headers
 * @returns {Array<[string, string]>}
 */
export function localHeaders(headers) {
  return headers
    .filter(([name]) => name !== 'Strict-Transport-Security')
    .map(([name, value]) =>
      name === 'Content-Security-Policy'
        ? [
            name,
            [...cspDirectives(value)]
              .filter(([directive]) => directive !== 'upgrade-insecure-requests')
              .map(([directive, sources]) => [directive, ...sources].join(' '))
              .join('; '),
          ]
        : [name, value],
    );
}
