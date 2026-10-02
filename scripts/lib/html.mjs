// @ts-check
// Minimal HTML reading for the checks of dist/ (build output, not arbitrary HTML).

const COMMENT = /<!--[\s\S]*?-->/g;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** @param {string} html */
export function stripComments(html) {
  return html.replace(COMMENT, '');
}

/**
 * Attributes of a start tag, by lower-case name (`''` for a valueless attribute).
 * @param {string} source the text between the tag name and `>`
 * @returns {Record<string, string>}
 */
export function parseAttributes(source) {
  return Object.fromEntries(
    Array.from(source.matchAll(ATTRIBUTE), ([, name, doubleQuoted, singleQuoted, unquoted]) => [
      name.toLowerCase(),
      doubleQuoted ?? singleQuoted ?? unquoted ?? '',
    ]),
  );
}
