// Tabs of the WAI-ARIA APG: arrows, Home and End move and select (automatic activation), the
// selected tab is the only one in the tab order (roving tabindex).
import type { Cleanup } from '@/lib/controllers.ts';
import { nextTabIndex } from '@/lib/tabs.ts';

/** Fired on the tabs element when another tab is selected: the hook of the motion module. */
export const TABS_EVENT = 'bv:tabs';

export interface TabsDetail {
  readonly tab: HTMLElement;
  readonly panel: HTMLElement;
}

export function init(element: HTMLElement): Cleanup {
  const tablist = element.querySelector<HTMLElement>('[role="tablist"]');
  if (tablist === null) throw new Error('tabs: tablist missing');
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = tabs.map((tab) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    if (panel === null) throw new Error(`tabs: no panel for tab "${tab.id}"`);
    // Panels are plain sections without JavaScript; they become tab panels here.
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    return panel;
  });

  let selected = Math.max(
    0,
    tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'),
  );
  const select = (index: number, focus: boolean) => {
    const changed = index !== selected;
    selected = index;
    tabs.forEach((tab, position) => {
      const isSelected = position === index;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      panels[position]?.toggleAttribute('data-active', isSelected);
    });
    if (focus) tabs[index]?.focus();
    const tab = tabs[index];
    const panel = panels[index];
    if (!changed || tab === undefined || panel === undefined) return;
    element.dispatchEvent(
      new CustomEvent<TabsDetail>(TABS_EVENT, { bubbles: true, detail: { tab, panel } }),
    );
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
    for (const panel of panels) {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.removeAttribute('tabindex');
    }
    tablist.removeEventListener('click', onClick);
    tablist.removeEventListener('keydown', onKeyDown);
  };
}
