// Tabs of the WAI-ARIA APG: arrows, Home and End move and select (automatic activation), the
// selected tab is the only one in the tab order (roving tabindex).
import type { Cleanup } from '@/lib/controllers.ts';
import { nextTabIndex } from '@/lib/tabs.ts';

export function init(element: HTMLElement): Cleanup {
  const tablist = element.querySelector<HTMLElement>('[role="tablist"]');
  if (tablist === null) throw new Error('tabs: tablist missing');
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = tabs.map((tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    if (panel === null) throw new Error(`tabs: no panel for tab "${tab.id}"`);
    return panel;
  });

  const select = (index: number, focus: boolean) => {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position]?.toggleAttribute('data-active', selected);
    });
    if (focus) tabs[index]?.focus();
  };

  const onClick = (event: MouseEvent) => {
    const tab = event.target instanceof Element ? event.target.closest('[role="tab"]') : null;
    const index = tabs.indexOf(tab as HTMLButtonElement);
    if (index >= 0) select(index, false);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    const next = nextTabIndex(event.key, current, tabs.length);
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  tablist.addEventListener('click', onClick);
  tablist.addEventListener('keydown', onKeyDown);
  return () => {
    tablist.removeEventListener('click', onClick);
    tablist.removeEventListener('keydown', onKeyDown);
  };
}
