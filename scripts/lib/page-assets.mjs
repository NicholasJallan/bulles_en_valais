// @ts-check
// Resources a built page loads, shared by the budget and dist/ checks.
import { parseAttributes, stripComments } from './html.mjs';

const TAG = /<(script|link)\b([^>]*)>/gi;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const LOCAL_ORIGIN = 'http://dist.invalid';

/**
 * @param {Record<string, string>} attributes
 * @param {string} rel
 */
function hasRel(attributes, rel) {
  return (attributes.rel ?? '').toLowerCase().split(/\s+/).includes(rel);
}

/** @param {{ name: string, attributes: Record<string, string> }} tag */
function scriptReference(tag) {
  const { src, href, as } = tag.attributes;
  if (tag.name === 'script') return src || null;
  const isScriptPreload =
    hasRel(tag.attributes, 'modulepreload') ||
    (hasRel(tag.attributes, 'preload') && as?.toLowerCase() === 'script');
  return isScriptPreload ? href || null : null;
}

/**
 * What a page loads up front, in document order: script sources and script
 * preloads, stylesheets, inline style blocks. Inline scripts are left out:
 * the CSP forbids them and scripts/check-dist.mjs rejects them.
 * @param {string} html
 */
export function extractPageAssets(html) {
  const markup = stripComments(html);
  const tags = Array.from(markup.matchAll(TAG), ([, name, attributes]) => ({
    name: name.toLowerCase(),
    attributes: parseAttributes(attributes),
  }));
  return {
    scripts: tags.map(scriptReference).filter((reference) => reference !== null),
    stylesheets: tags
      .filter((tag) => tag.name === 'link' && hasRel(tag.attributes, 'stylesheet'))
      .map((tag) => tag.attributes.href)
      .filter(Boolean),
    inlineStyles: Array.from(markup.matchAll(STYLE_BLOCK), ([, css]) => css),
  };
}

/**
 * URL path of a same-origin reference, without query or fragment; null if external.
 * @param {string} reference
 * @param {string} fromPath URL path of the referring page or module
 */
export function resolveLocalPath(reference, fromPath) {
  const url = new URL(reference, LOCAL_ORIGIN + fromPath);
  return url.origin === LOCAL_ORIGIN ? decodeURIComponent(url.pathname) : null;
}
