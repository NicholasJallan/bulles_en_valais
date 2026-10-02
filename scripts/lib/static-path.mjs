import { join, normalize, sep } from 'node:path';

/**
 * What a static server answers for a URL path under `root`: a file, a redirect that adds the
 * trailing slash of a directory, or not found (also for any path that would leave `root`).
 * @param {string} root absolute directory
 * @param {string} pathname URL path, still percent-encoded
 * @param {(path: string) => boolean} isDirectory
 * @returns {{ file: string } | { redirect: string } | { notFound: true }}
 */
export function staticTarget(root, pathname, isDirectory) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { notFound: true };
  }
  if (decoded.includes('\0') || decoded.split('/').includes('..')) return { notFound: true };
  const path = normalize(join(root, decoded));
  if (path !== root && !path.startsWith(root + sep)) return { notFound: true };
  if (isDirectory(path.replace(/\/$/, '') || root)) {
    return decoded.endsWith('/')
      ? { file: join(path, 'index.html') }
      : { redirect: `${pathname}/` };
  }
  return { file: path };
}
