// @ts-check
// Pure helpers of scripts/check-dist.mjs: what the target CSP and the server forbid in dist/.
import { parseAttributes, stripComments } from './html.mjs';
import { extractPageAssets, resolveLocalPath } from './page-assets.mjs';

const SCRIPT_ELEMENT = /<script\b([^>]*)>[\s\S]*?<\/script\s*>/gi;
const START_TAG = /<([a-z][a-z0-9-]*)\b([^>]*)>/gi;
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'xlink:href']);
const JAVASCRIPT_URL = /^\s*javascript:/i;
const ALLOWED_INLINE_TYPE = 'application/ld+json';
const CONTACT_ENDPOINT = 'api/contact.php';
const REQUIRED_FILES = [CONTACT_ENDPOINT];
// Mirrors the secrets refused by the dev server (astro.config.mjs): hidden files
// (.DS_Store, .env, .git… but .well-known/), keys and certificates, local settings.
const HIDDEN_SEGMENT = /(^|\/)\.(?!well-known\/)/;
const KEY_FILE = /\.(crt|pem|key|p12|pfx|cer|der)$/;
const LOCAL_SETTINGS = /(^|\/)settings\.json$/;

/**
 * @param {string} name lower-case tag name
 * @param {Record<string, string>} attributes
 * @returns {string[]}
 */
function tagIssues(name, attributes) {
  const { src, type } = attributes;
  const isInlineScript =
    name === 'script' &&
    src === undefined &&
    (type ?? '').trim().toLowerCase() !== ALLOWED_INLINE_TYPE;
  const attributeIssues = Object.entries(attributes).flatMap(([attribute, value]) => {
    if (attribute.startsWith('on')) return [`inline handler ${attribute}`];
    if (URL_ATTRIBUTES.has(attribute) && JAVASCRIPT_URL.test(value)) {
      return [`javascript: URL in ${attribute}`];
    }
    return [];
  });
  return [
    ...(isInlineScript ? [`inline <script${type === undefined ? '' : ` type="${type}"`}>`] : []),
    ...attributeIssues,
  ];
}

/**
 * Inline JavaScript, which the target CSP blocks, in document order: inline
 * scripts (JSON-LD excepted), event handler attributes and javascript: URLs.
 * @param {string} html
 */
export function inlineScriptIssues(html) {
  // Script contents are not markup: keep the start tag only.
  const markup = stripComments(html).replace(
    SCRIPT_ELEMENT,
    (_element, attributes) => `<script${attributes}>`,
  );
  return Array.from(markup.matchAll(START_TAG), ([, name, attributes]) =>
    tagIssues(name.toLowerCase(), parseAttributes(attributes)),
  ).flat();
}

/** @param {string} reference */
function isLocal(reference) {
  try {
    return resolveLocalPath(reference, '/') !== null;
  } catch {
    return false; // not even a valid URL
  }
}

/**
 * Scripts, script preloads and stylesheets of another origin (CDN, data: URI):
 * the target CSP blocks them, and everything is self-hosted anyway.
 * @param {string} html
 */
export function externalResources(html) {
  const { scripts, stylesheets } = extractPageAssets(html);
  return [...scripts, ...stylesheets].filter((reference) => !isLocal(reference));
}

/**
 * Files the site cannot do without (the contact form posts to api/contact.php).
 * @param {readonly string[]} files relative to dist/, with `/` separators
 */
export function missingFiles(files) {
  return REQUIRED_FILES.filter((file) => !files.includes(file));
}

/**
 * Files that must never be published: anything under api/ and any PHP file but
 * the contact endpoint (nginx runs only this one; a copy of mail-config.php
 * would leak the SMTP credentials), hidden files, keys and local settings.
 * @param {readonly string[]} files relative to dist/, with `/` separators
 */
export function forbiddenFiles(files) {
  return files.filter((file) => {
    if (file === CONTACT_ENDPOINT) return false;
    const lower = file.toLowerCase();
    return (
      lower.startsWith('api/') ||
      lower.endsWith('.php') ||
      HIDDEN_SEGMENT.test(lower) ||
      KEY_FILE.test(lower) ||
      LOCAL_SETTINGS.test(lower)
    );
  });
}
