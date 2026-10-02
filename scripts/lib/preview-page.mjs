// @ts-check
// Pages of the preview published on the Pi next to the live site (scripts/preview-pi.mjs): their
// links stay inside the preview folder, search engines keep away, and the Google tag stays off.

/** Root files and folders that stay where they are: assets shared with the preview. */
const SHARED = /^\/(?:_astro\/|js\/|og\/|favicon|apple-touch-icon|icon-|site\.webmanifest)/;
const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

/**
 * @param {string} html a page of dist/
 * @param {string} prefix folder of the preview on the server, like `/preview/`
 */
export function rewriteForPreview(html, prefix) {
  if (!/^\/[\w-]+\/$/.test(prefix)) throw new RangeError(`Not a folder: ${prefix}`);
  const linked = html.replace(/href="(\/[^"]*)"/g, (match, /** @type {string} */ target) =>
    SHARED.test(target) ? match : `href="${prefix}${target.slice(1)}"`,
  );
  const robots = /<meta name="robots"[^>]*>/;
  return robots.test(linked)
    ? linked.replace(robots, NOINDEX)
    : linked.replace('<head>', `<head>${NOINDEX}`);
}

/** consent-default.js loads the Google tag on the production host only: not on the preview. */
export function disableGoogleTag(/** @type {string} */ script) {
  const host = /PRODUCTION_HOST = '[^']*'/;
  if (!host.test(script)) throw new Error('PRODUCTION_HOST not found in consent-default.js');
  return script.replace(host, "PRODUCTION_HOST = 'preview.invalid'");
}
