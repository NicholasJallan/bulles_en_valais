// When motion runs: no reduced motion asked by the system, and no calm mode (html.motion-ok,
// set by public/js/boot.js). gsap.matchMedia undoes everything if the system setting changes.
import type { Cleanup } from '@/lib/controllers.ts';
import { gsap } from './gsap.ts';

export const CONDITIONS = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 1024px)',
  fine: '(hover: hover) and (pointer: fine)',
} as const;

export type MotionConditions = Readonly<Record<keyof typeof CONDITIONS, boolean>>;

const root = document.documentElement;

export const isMotionAllowed = (): boolean => root.classList.contains('motion-ok');

/**
 * Runs `setup` while motion is allowed, again whenever a condition changes (its cleanup first).
 * Reduced motion asked meanwhile also withdraws motion-ok, which shows the hidden reveals.
 */
export function whileMotion(setup: (conditions: MotionConditions) => Cleanup): Cleanup {
  const media = gsap.matchMedia();
  media.add(CONDITIONS, (context) => {
    const conditions = context.conditions as MotionConditions;
    root.classList.toggle('motion-ok', conditions.motion);
    if (!conditions.motion) return undefined;
    return setup(conditions);
  });
  return () => media.revert();
}
