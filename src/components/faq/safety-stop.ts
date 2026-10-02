// The safety stop (E13): while the FAQ crosses the middle of the screen, the HUD shows « Stop 5 m »
// and counts three minutes down; out of view, the count waits. Going back up the page (deeper
// water, above the stop) starts the next stop from 3:00. Runs without the motion module too: the
// gauge is a reading, not an animation.
import { resetSafetyStop, setMode } from '@/components/hud/hud.ts';
import type { Cleanup } from '@/lib/controllers.ts';

export function init(section: HTMLElement): Cleanup {
  let atStop = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry === undefined || entry.isIntersecting === atStop) return;
      atStop = entry.isIntersecting;
      setMode(atStop ? 'safety-stop' : null);
      // Left through the top of the screen's middle band: the visitor went back down the dive.
      if (!atStop && entry.boundingClientRect.top > 0) resetSafetyStop();
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  observer.observe(section);
  return () => {
    observer.disconnect();
    if (atStop) setMode(null);
  };
}
