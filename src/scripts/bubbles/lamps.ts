// E17: the lamp buttons let 2 or 3 bubbles escape on hover, and a sheaf of them when pressed
// (`bv:lamp`, emitted by scripts/motion/magnetic.ts on fine pointers).
import { currentDepth } from '@/components/hud/hud.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { LAMP_EVENT, type LampDetail } from '@/scripts/motion/magnetic.ts';
import type { Emitter } from './emitter.ts';

const HOVER_BUBBLES = [2, 3] as const;
const PRESS_BUBBLES = 14;

export function bubblesOnLamps(emitter: Emitter): Cleanup {
  const onLamp = (event: Event): void => {
    if (!(event.target instanceof Element)) return;
    const { phase } = (event as CustomEvent<LampDetail>).detail;
    const box = event.target.getBoundingClientRect();
    const count =
      phase === 'press' ? PRESS_BUBBLES : (HOVER_BUBBLES[Math.round(Math.random())] ?? 2);
    emitter.burst(box.left + box.width / 2, box.top, count, currentDepth());
  };
  document.addEventListener(LAMP_EVENT, onLamp);
  return () => document.removeEventListener(LAMP_EVENT, onLamp);
}
