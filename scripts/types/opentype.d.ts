// The part of opentype.js the asset scripts use (the package ships no types).
declare module 'opentype.js' {
  import type { Font } from '../lib/text-path.mjs';

  const opentype: { parse(buffer: ArrayBuffer): Font };
  export default opentype;
}
