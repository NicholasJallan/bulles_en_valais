// Snell's window in motion (E14): as the contact section comes up, the disc of light opens and
// brightens, and the ripples inside it drift with the scroll. Once in place, the surface keeps
// moving gently: a second swell drifts across the first one and the window breathes, as when
// looking up from a safety stop. The swell runs only while the section is on screen
// (transform and opacity only).
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, seconds } from '@/lib/motion/tokens.ts';
import { gsap, ScrollTrigger } from '@/scripts/motion/gsap.ts';

const OPEN_FROM_SCALE = 0.55;
const SHIMMER_DRIFT_PERCENT = 14;
/** The swell: slow, a few tides long, never in step with itself. */
const SWELL_S = seconds(DURATIONS_MS.tide) * 3;
const WAVES_DRIFT_PERCENT = 6;
const BREATH_SCALE = 1.025;

interface Parts {
  readonly section: HTMLElement;
  readonly swell: HTMLElement;
  readonly disc: HTMLElement;
  readonly shimmer: HTMLElement;
  readonly waves: HTMLElement;
}

function findParts(): Parts | undefined {
  const section = document.getElementById('contact');
  const find = (name: string) => section?.querySelector<HTMLElement>(`[data-snell-${name}]`);
  const [swell, disc, shimmer, waves] = ['swell', 'disc', 'shimmer', 'waves'].map(find);
  if (!section || !swell || !disc || !shimmer || !waves) return undefined;
  return { section, swell, disc, shimmer, waves };
}

/** The window opens with the scroll, its ripples drifting along. */
function openWithScroll({ section, disc, shimmer }: Parts): void {
  gsap.fromTo(
    disc,
    { scale: OPEN_FROM_SCALE, autoAlpha: 0.3 },
    {
      scale: 1,
      autoAlpha: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: true },
    },
  );
  gsap.fromTo(
    shimmer,
    { xPercent: -SHIMMER_DRIFT_PERCENT, yPercent: SHIMMER_DRIFT_PERCENT },
    {
      xPercent: SHIMMER_DRIFT_PERCENT,
      yPercent: -SHIMMER_DRIFT_PERCENT,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

/** The surface moving on its own: paused off screen. */
function swell({ section, swell: breathing, waves }: Parts): void {
  const loop = { repeat: -1, yoyo: true, ease: 'drift' } as const;
  const timeline = gsap.timeline({ paused: true });
  timeline
    .fromTo(
      waves,
      { xPercent: -WAVES_DRIFT_PERCENT, yPercent: -WAVES_DRIFT_PERCENT / 2, rotation: -2 },
      {
        xPercent: WAVES_DRIFT_PERCENT,
        yPercent: WAVES_DRIFT_PERCENT / 2,
        rotation: 2,
        duration: SWELL_S,
        ...loop,
      },
      0,
    )
    .fromTo(waves, { opacity: 0.06 }, { opacity: 0.14, duration: SWELL_S * 0.6, ...loop }, 0)
    .fromTo(breathing, { scale: 1 }, { scale: BREATH_SCALE, duration: SWELL_S * 0.8, ...loop }, 0);
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? timeline.play() : timeline.pause()),
  });
}

export function openSnellWindow(): Cleanup {
  const parts = findParts();
  if (parts === undefined) return () => undefined;
  const context = gsap.context(() => {
    openWithScroll(parts);
    swell(parts);
  });
  return () => context.revert();
}
