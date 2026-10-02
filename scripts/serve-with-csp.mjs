// Serves dist/ on 127.0.0.1 with the security headers of ops/nginx/security-headers.conf (minus
// what needs HTTPS), for the `csp` Playwright project: the site must run under its final CSP
// without a single violation. Text is gzipped, as the final nginx block will (S13): the closest
// local stand-in for production when measuring. Usage: node scripts/serve-with-csp.mjs --port 4341
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createGzip } from 'node:zlib';
import { localHeaders, parseAddHeaders } from './lib/nginx-headers.mjs';
import { staticTarget } from './lib/static-path.mjs';

const ROOT = resolve('dist');
const CONF = new URL('../ops/nginx/security-headers.conf', import.meta.url);
const HEADERS = localHeaders(parseAddHeaders(readFileSync(CONF, 'utf8')));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const isDirectory = (path) => statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false;
const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

const COMPRESSED = new Set([
  '.html',
  '.js',
  '.css',
  '.json',
  '.webmanifest',
  '.xml',
  '.txt',
  '.svg',
]);

function send(request, response, status, file) {
  const gzip =
    COMPRESSED.has(extname(file)) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '');
  response.writeHead(status, {
    ...Object.fromEntries(HEADERS),
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
    Vary: 'Accept-Encoding',
    ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
  });
  const body = createReadStream(file).on('error', () => response.destroy());
  (gzip ? body.pipe(createGzip()) : body).pipe(response);
}

const { values } = parseArgs({ options: { port: { type: 'string', default: '4341' } } });

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, Object.fromEntries(HEADERS)).end();
    return;
  }
  // Collapse leading slashes: `//host` in a redirect would leave this server.
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/^\/+/, '/');
  const target = staticTarget(ROOT, pathname, isDirectory);
  if ('redirect' in target) {
    response.writeHead(301, { ...Object.fromEntries(HEADERS), Location: target.redirect }).end();
  } else if ('file' in target && isFile(target.file)) {
    send(request, response, 200, target.file);
  } else {
    send(request, response, 404, resolve(ROOT, '404.html'));
  }
}).listen(Number(values.port), '127.0.0.1');
