// Styleguide controller: loads the GSAP demos only when motion is allowed (html.motion-ok).
import type { Cleanup } from '@/lib/controllers.ts';

const isMotionAllowed = (): boolean => document.documentElement.classList.contains('motion-ok');

export function init(section: HTMLElement): Cleanup {
  if (!isMotionAllowed()) {
    section.dataset.motion = 'off';
    return () => undefined;
  }

  let stop: Cleanup | undefined;
  let cancelled = false;
  import('./motion-demos.ts')
    .then(({ startDemos }) => {
      // boot.js may have withdrawn motion-ok meanwhile (3 s safety net): check again.
      if (cancelled || !isMotionAllowed()) {
        section.dataset.motion = 'off';
        return;
      }
      stop = startDemos(section);
      section.dataset.motion = 'on';
      document.documentElement.classList.add('motion-ready');
    })
    .catch((error: unknown) => {
      section.dataset.motion = 'off';
      console.error('Styleguide motion demos failed to start', error);
    });

  return () => {
    cancelled = true;
    stop?.();
  };
}
