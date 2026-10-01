// Minimal reader for design-token stylesheets: enough to check that tokens.css matches its
// TypeScript mirrors, not a general CSS parser (no strings containing braces or semicolons).

interface Block {
  readonly selectors: readonly string[];
  readonly body: string;
}

const COMMENT = /\/\*[\s\S]*?\*\//g;
const DECLARATION = /^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/;

const normalizeSelector = (selector: string): string =>
  selector.trim().replace(/\s+/g, ' ').replaceAll('"', "'");

/** Splits `text` on `separator` where the brace depth is zero. */
function splitTopLevel(text: string, separator: ';' | '}'): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    const isSeparator = separator === '}' ? char === '}' && depth === 0 : char === ';';
    if (isSeparator && depth === 0) {
      parts.push(text.slice(start, index + 1));
      start = index + 1;
    }
  }
  return [...parts, text.slice(start)];
}

/** Top-level style rules (at-rules and their nested blocks are skipped). */
function topLevelBlocks(css: string): Block[] {
  return splitTopLevel(css.replace(COMMENT, ''), '}').flatMap((chunk) => {
    const open = chunk.indexOf('{');
    if (open === -1 || !chunk.trimEnd().endsWith('}')) return [];
    const prelude = chunk.slice(0, open).split(';').at(-1) ?? '';
    if (prelude.trim().startsWith('@')) return [];
    const body = chunk.slice(open + 1, chunk.lastIndexOf('}'));
    return [{ selectors: prelude.split(',').map(normalizeSelector), body }];
  });
}

/** Custom properties declared directly in a block (nested rules are ignored). */
function declarations(body: string): Array<[string, string]> {
  return splitTopLevel(body, ';').flatMap((segment) => {
    if (segment.includes('{')) return [];
    const match = DECLARATION.exec(segment.replace(/;$/, ''));
    return match ? [[match[1], match[2].replace(/\s+/g, ' ')] as [string, string]] : [];
  });
}

/**
 * Custom properties of the top-level rules whose selector list contains `selector`
 * (quotes and whitespace normalised), later declarations overriding earlier ones.
 */
export function customProperties(css: string, selector: string): ReadonlyMap<string, string> {
  const target = normalizeSelector(selector);
  const entries = topLevelBlocks(css)
    .filter((block) => block.selectors.includes(target))
    .flatMap((block) => declarations(block.body));
  return new Map(entries);
}
