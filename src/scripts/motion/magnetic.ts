// The lamp buttons (E17): a magnetic pull of 6 px at most towards a fine pointer, through the
// `translate` property (the press keeps its own `transform`). `bv:lamp` events, bubbling from
// the button on hover and press, are the hook for the bubbles of S08.
import type { Cleanup } from '@/lib/controllers.ts';
import { magneticOffset, type Box } from '@/lib/motion/magnetic.ts';

export const LAMP_EVENT = 'bv:lamp';

export interface LampDetail {
  readonly phase: 'enter' | 'press';
}

const SELECTOR = '.button-primary';

function attract(button: HTMLElement): Cleanup {
  let box: Box | undefined;
  let frame = 0;
  let pointer = { x: 0, y: 0 };
  const lamp = (phase: LampDetail['phase']): void => {
    button.dispatchEvent(
      new CustomEvent<LampDetail>(LAMP_EVENT, { bubbles: true, detail: { phase } }),
    );
  };
  const apply = (): void => {
    frame = 0;
    if (box === undefined) return;
    // Measured again on each frame: Lenis may scroll the page under a still pointer.
    box = button.getBoundingClientRect();
    const { x, y } = magneticOffset(box, pointer.x, pointer.y);
    button.style.setProperty('--magnet-x', `${x}px`);
    button.style.setProperty('--magnet-y', `${y}px`);
  };
  const onEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    box = button.getBoundingClientRect();
    lamp('enter');
  };
  const onMove = (event: PointerEvent): void => {
    if (box === undefined) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (frame === 0) frame = requestAnimationFrame(apply);
  };
  const onLeave = (): void => {
    box = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    button.style.removeProperty('--magnet-x');
    button.style.removeProperty('--magnet-y');
  };
  const onPress = (): void => lamp('press');
  button.addEventListener('pointerenter', onEnter);
  button.addEventListener('pointermove', onMove);
  button.addEventListener('pointerleave', onLeave);
  button.addEventListener('click', onPress);
  return () => {
    onLeave();
    button.removeEventListener('pointerenter', onEnter);
    button.removeEventListener('pointermove', onMove);
    button.removeEventListener('pointerleave', onLeave);
    button.removeEventListener('click', onPress);
  };
}

export function magnetize(): Cleanup {
  const cleanups = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR), attract);
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
