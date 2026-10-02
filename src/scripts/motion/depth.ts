// Feeds the HUD the precise depth (E3): the sections are measured on every ScrollTrigger refresh
// (never while scrolling), then each scrolled frame resolves the depth under the probe line.
import { releaseReadings, showReading } from '@/components/hud/hud.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { probeLine, resolveDepth, type MeasuredSection } from '@/lib/depth/resolve-depth.ts';
import { ScrollTrigger } from './gsap.ts';

function measure(elements: readonly HTMLElement[]): MeasuredSection[] {
  const scrollY = window.scrollY;
  return elements.map((element) => {
    const { top, height } = element.getBoundingClientRect();
    return {
      id: element.id,
      top: top + scrollY,
      bottom: top + scrollY + height,
      start: Number(element.dataset.depthStart),
      end: Number(element.dataset.depthEnd),
      hidden: element.dataset.hud === 'hidden',
    };
  });
}

export function trackDepth(): Cleanup {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-depth-start]'));
  if (elements.length === 0) return () => undefined;
  let sections: MeasuredSection[] = [];
  let viewport = 0;
  let page = 0;

  const update = (scroll: number): void => {
    showReading(resolveDepth(sections, probeLine(scroll, viewport, page)));
  };
  const refresh = (scroll: number): void => {
    sections = measure(elements);
    viewport = window.innerHeight;
    page = document.documentElement.scrollHeight;
    update(scroll);
  };
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onRefresh: (self) => refresh(self.scroll()),
    onUpdate: (self) => update(self.scroll()),
  });
  refresh(trigger.scroll());
  return () => {
    trigger.kill();
    releaseReadings();
  };
}
