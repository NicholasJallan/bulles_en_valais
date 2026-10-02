// Motion of the tabs (S08, Cursus; also the Specialties tabs): a light that slides from one tab
// to the next (clip-path over the tab list), the new panel that fades in and rises slightly, its
// headline lines and its rows (prices, specialty cards) in cascade, settled within 0.6 s. The
// tabs themselves (tabs.ts) do not change: keyboard, roles and states stay those of the APG pattern.
import type { Cleanup } from '@/lib/controllers.ts';
import { cascadeStagger } from '@/lib/motion/cascade.ts';
import { DURATIONS_MS, STAGGER_MS, seconds } from '@/lib/motion/tokens.ts';
import { gsap, type SplitText } from '@/scripts/motion/gsap.ts';
import { splitLines } from '@/scripts/motion/split.ts';
import { TABS_EVENT, type TabsDetail } from './tabs.ts';

const PANEL_RISE_PX = 16;
const ROW_RISE_PX = 8;
const LINE_START_PERCENT = 120;
/** The rows (prices, specialty cards) have all settled within this time (brief S09: 0.6 s). */
const CASCADE_TOTAL_MS = 600;
const ROW_MS = DURATIONS_MS.fast;

/** A headline split by an entrance still running: undone before the next one (quick switches). */
const splits = new WeakMap<HTMLElement, SplitText>();
/** The entrance still running in a panel: finished at once before the next one starts. */
const entrances = new WeakMap<HTMLElement, gsap.core.Timeline>();

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
  // The tabs too: a web font swap changes their width, not always the list's.
  const observer = new ResizeObserver(place);
  observer.observe(list);
  for (const tab of list.querySelectorAll('[role="tab"]')) observer.observe(tab);
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
  entrances.get(panel)?.progress(1).kill();
  const timeline = gsap.timeline({ onComplete: () => entrances.delete(panel) });
  entrances.set(panel, timeline);
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
          if (splits.get(headline) === split) splits.delete(headline);
        },
      },
      0,
    );
  }
  const rows = panel.querySelectorAll('[data-tab-row]');
  if (rows.length > 0) {
    const step = cascadeStagger({
      count: rows.length,
      step: STAGGER_MS.line / 2,
      duration: ROW_MS,
      total: CASCADE_TOTAL_MS,
    });
    timeline.from(
      rows,
      {
        opacity: 0,
        y: ROW_RISE_PX,
        duration: seconds(ROW_MS),
        ease: 'buoyant',
        stagger: seconds(step),
        clearProps: 'opacity,transform',
      },
      0,
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
