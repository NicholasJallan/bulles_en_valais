// SplitText wrapper for the titles (E5): lines in masks, padded so that accents and descenders
// are not cut while they rise (.reveal-line-mask in motion.css).
import { SplitText } from './gsap.ts';

export function splitLines(element: HTMLElement): SplitText {
  return SplitText.create(element, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'reveal-line',
  });
}
