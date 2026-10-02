// Motion of the tabs (S08, Cursus; also the Specialties tabs): a light that slides from one tab
// to the next (clip-path over the tab list), the new panel that fades in and rises slightly, its
// headline lines and its price rows in cascade. The tabs themselves (tabs.ts) do not change:
// keyboard, roles and states stay those of the APG pattern.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, STAGGER_MS, seconds } from '@/lib/motion/tokens.ts';
import { gsap, type SplitText } from '@/scripts/motion/gsap.ts';
import { splitLines } from '@/scripts/motion/split.ts';
import { TABS_EVENT, type TabsDetail } from './tabs.ts';

const PANEL_RISE_PX = 16;
const ROW_RISE_PX = 8;
const LINE_START_PERCENT = 120;

/** A headline split by an entrance still running: undone before the next one (quick switches). */
const splits = new WeakMap<HTMLElement, SplitText>();

/** The inset of `tab` inside `list`, as a clip-path the indicator can tween to. */
function insetOf(list: HTMLElement, tab: HTMLElement): string {
  const outer = list.getBoundingClientRect();
  const inner = tab.getBoundingClientRect();
  const top = inner.top - outer.top - list.clientTop;
  const left = inner.left - outer.left - list.clientLeft;
  const right = list.clientWidth - left - inner.width;
  const bottom = list.clientHeight - top - inner.height;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`;
}

function slideIndicator(list: HTMLElement): Cleanup {
  const indicator = document.createElement('span');
  indicator.className = 'tab-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  list.prepend(indicator);
  list.dataset.indicator = '';
  const selectedTab = (): HTMLElement | null =>
    list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  const place = (): void => {
    const tab = selectedTab();
    if (tab !== null) gsap.set(indicator, { clipPath: insetOf(list, tab) });
  };
  const observer = new ResizeObserver(place);
  observer.observe(list);
  place();
  const onTabs = (event: Event): void => {
    const { tab } = (event as CustomEvent<TabsDetail>).detail;
    if (!list.contains(tab)) return;
    gsap.to(indicator, {
      clipPath: insetOf(list, tab),
      duration: seconds(DURATIONS_MS.base),
      ease: 'surface',
      overwrite: true,
    });
  };
  document.addEventListener(TABS_EVENT, onTabs);
  return () => {
    document.removeEventListener(TABS_EVENT, onTabs);
    observer.disconnect();
    gsap.killTweensOf(indicator);
    indicator.remove();
    delete list.dataset.indicator;
  };
}

/** The new panel settles; its headline rises line by line and its prices follow one another. */
function enterPanel(panel: HTMLElement): void {
  gsap.killTweensOf(panel);
  const timeline = gsap.timeline();
  timeline.fromTo(
    panel,
    { opacity: 0, y: PANEL_RISE_PX },
    {
      opacity: 1,
      y: 0,
      duration: seconds(DURATIONS_MS.slow),
      ease: 'buoyant',
      clearProps: 'opacity,transform',
    },
  );
  const headline = panel.querySelector<HTMLElement>('[data-tab-headline]');
  if (headline !== null) {
    splits.get(headline)?.revert();
    const split = splitLines(headline);
    splits.set(headline, split);
    timeline.from(
      split.lines,
      {
        yPercent: LINE_START_PERCENT,
        duration: seconds(DURATIONS_MS.rise),
        ease: 'buoyant',
        stagger: seconds(STAGGER_MS.line),
        onComplete: () => {
          split.revert();
          splits.delete(headline);
        },
      },
      0,
    );
  }
  const rows = panel.querySelectorAll('[data-tab-row]');
  if (rows.length > 0) {
    timeline.from(
      rows,
      {
        opacity: 0,
        y: ROW_RISE_PX,
        duration: seconds(DURATIONS_MS.base),
        ease: 'buoyant',
        stagger: seconds(STAGGER_MS.line) / 2,
        clearProps: 'opacity,transform',
      },
      seconds(DURATIONS_MS.fast) / 2,
    );
  }
}

export function animateTabs(): Cleanup {
  const context = gsap.context(() => undefined);
  const lists = Array.from(
    document.querySelectorAll<HTMLElement>('[data-controller~="tabs"] [role="tablist"]'),
  );
  const cleanups = lists.map(slideIndicator);
  const onTabs = (event: Event): void => {
    const { panel } = (event as CustomEvent<TabsDetail>).detail;
    context.add(() => enterPanel(panel));
  };
  document.addEventListener(TABS_EVENT, onTabs);
  return () => {
    document.removeEventListener(TABS_EVENT, onTabs);
    context.revert();
    for (const cleanup of cleanups) cleanup();
  };
}
