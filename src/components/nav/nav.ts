// Mobile menu: a modal <dialog> (the browser traps the focus and closes it on Escape). Closing it
// gives the focus back to the menu button, unless a link of the page was followed: the focus then
// moves to the heading of the section reached, so that the keyboard carries on from there.
import type { Cleanup } from '@/lib/controllers.ts';

function focusSection(id: string): void {
  const section = document.getElementById(id);
  const heading = section?.querySelector<HTMLElement>('h1, h2') ?? section;
  if (heading === null || heading === undefined) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

function goToAnchor(hash: string): void {
  const id = decodeURIComponent(hash.slice(1));
  if (window.location.hash === hash) document.getElementById(id)?.scrollIntoView();
  else window.location.hash = hash;
  focusSection(id);
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
  return () => {
    opener.removeEventListener('click', open);
    dialog.removeEventListener('click', onClick);
    dialog.removeEventListener('close', onClose);
    if (dialog.open) dialog.close();
  };
}
