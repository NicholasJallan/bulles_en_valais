// « Calm mode »: no animation and no smooth scrolling, remembered in localStorage (read by
// public/js/boot.js before the page paints), so the page reloads to start without motion.
import type { Cleanup } from '@/lib/controllers.ts';

export const CALM_KEY = 'bv-calm';

function isCalm(): boolean {
  try {
    return window.localStorage.getItem(CALM_KEY) === '1';
  } catch {
    return false; // storage blocked: calm mode cannot be remembered, motion stays the default
  }
}

function remember(calm: boolean): boolean {
  try {
    if (calm) window.localStorage.setItem(CALM_KEY, '1');
    else window.localStorage.removeItem(CALM_KEY);
    return true;
  } catch {
    return false;
  }
}

export function init(element: HTMLElement): Cleanup {
  if (!(element instanceof HTMLButtonElement)) throw new Error('calm-mode: expects a button');
  element.setAttribute('aria-pressed', String(isCalm()));

  const onClick = () => {
    const calm = element.getAttribute('aria-pressed') !== 'true';
    // Masthead, menu and footer each hold a switch: all show the same state.
    for (const toggle of document.querySelectorAll('[data-controller~="calm-mode"]')) {
      toggle.setAttribute('aria-pressed', String(calm));
    }
    document.documentElement.classList.toggle('calm', calm);
    if (remember(calm)) window.location.reload();
  };

  element.addEventListener('click', onClick);
  return () => element.removeEventListener('click', onClick);
}
