// Mobile menu: a modal <dialog> (the browser traps the focus and closes it on Escape). Closing it
// gives the focus back to the menu button, unless a link of the page was followed: the focus then
// moves to the heading of the section reached, so that the keyboard carries on from there.
// The links of the section being read are marked (aria-current), from the HUD's section events.
import { SECTION_EVENT, type SectionDetail } from '@/components/hud/events.ts';
import type { Cleanup } from '@/lib/controllers.ts';
import { focusSection } from '@/scripts/focus-section.ts';

function goToAnchor(hash: string): void {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (window.location.hash === hash) target?.scrollIntoView();
  else window.location.hash = hash;
  if (target !== null) focusSection(target);
}

function markCurrentSection(element: HTMLElement): Cleanup {
  const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href*="#"]'));
  const onSection = (event: Event): void => {
    const { id } = (event as CustomEvent<SectionDetail>).detail;
    for (const link of links) {
      if (link.hash === `#${id}` && !link.classList.contains('brand')) {
        link.setAttribute('aria-current', 'true');
      } else link.removeAttribute('aria-current');
    }
  };
  document.addEventListener(SECTION_EVENT, onSection);
  return () => document.removeEventListener(SECTION_EVENT, onSection);
}

/** Hash of a link to a section of the current page, or `undefined` for any other link. */
function samePageHash(link: HTMLAnchorElement): string | undefined {
  const url = new URL(link.href);
  return url.pathname === window.location.pathname && url.hash !== '' ? url.hash : undefined;
}

export function init(element: HTMLElement): Cleanup {
  const opener = element.querySelector<HTMLButtonElement>('[data-menu-open]');
  const dialog = element.querySelector<HTMLDialogElement>('dialog');
  if (opener === null || dialog === null) throw new Error('nav: menu button or dialog missing');
  let returnFocus = true;

  const open = () => {
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
  };
  const onClose = () => {
    opener.setAttribute('aria-expanded', 'false');
    if (returnFocus) opener.focus();
    returnFocus = true;
  };
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-menu-close]')) return dialog.close();
    const link = target?.closest<HTMLAnchorElement>('a[data-menu-link]');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    const hash = samePageHash(link);
    if (hash === undefined) return dialog.close();
    event.preventDefault();
    returnFocus = false;
    dialog.close();
    goToAnchor(hash);
  };

  opener.addEventListener('click', open);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', onClose);
  const unmark = markCurrentSection(element);
  return () => {
    unmark();
    opener.removeEventListener('click', open);
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('close', onClose);
    if (dialog.open) dialog.close();
  };
}
