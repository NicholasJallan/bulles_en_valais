import { describe, expect, it } from 'vitest';
import { parseAttributes, stripComments } from './html.mjs';

describe('parseAttributes', () => {
  it('reads quoted, unquoted and valueless attributes, with lower-case names', () => {
    expect(parseAttributes(` type="module" SRC='/a.js' defer data-x=1 `)).toEqual({
      type: 'module',
      src: '/a.js',
      defer: '',
      'data-x': '1',
    });
  });
});

describe('stripComments', () => {
  it('removes every HTML comment', () => {
    expect(stripComments('a<!-- x -->b<!--\ny\n-->c')).toBe('abc');
  });
});
