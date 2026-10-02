// Smoothed scrolling (fine pointers only), synchronised with ScrollTrigger (02-architecture.md §8).
// Same-page links scroll through Lenis, update the address and move the focus to the section.
import Lenis from 'lenis';
import type { Cleanup } from '@/lib/controllers.ts';
import { focusSection } from '../focus-section.ts';
import { gsap, ScrollTrigger } from './gsap.ts';

const DEFAULT_LAG_SMOOTHING = [500, 33] as const;

/** Lenis stops while a modal dialog is open: the page behind must not scroll. */
function pauseWithDialogs(lenis: Lenis): Cleanup {
  const dialogs = Array.from(document.querySelectorAll('dialog'));
  const sync = (): void => {
    if (dialogs.some((dialog) => dialog.open)) lenis.stop();
    else lenis.start();
  };
  const observer = new MutationObserver(sync);
  for (const dialog of dialogs) observer.observe(dialog, { attributeFilter: ['open'] });
  return () => observer.disconnect();
}

function samePageTarget(event: MouseEvent): { hash: string; target: HTMLElement } | undefined {
  if (event.defaultPrevented || event.button !== 0) return undefined;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return undefined;
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(link instanceof HTMLAnchorElement) || link.classList.contains('skip-link'))
    return undefined;
  if (link.target !== '' || link.hasAttribute('download')) return undefined;
  const url = new URL(link.href);
  const here = window.location;
  if (url.origin !== here.origin || url.pathname !== here.pathname || url.hash.length < 2) {
    return undefined;
  }
  let id: string;
  try {
    id = decodeURIComponent(url.hash.slice(1));
  } catch {
    return undefined; // malformed escape: let the browser handle the link
  }
  const target = document.getElementById(id);
  return target === null ? undefined : { hash: url.hash, target };
}

function handleAnchors(lenis: Lenis): Cleanup {
  const onClick = (event: MouseEvent): void => {
    const jump = samePageTarget(event);
    if (jump === undefined || lenis.isStopped) return;
    event.preventDefault();
    if (window.location.hash !== jump.hash) window.history.pushState(null, '', jump.hash);
    // Lenis subtracts the scroll-padding of the page (the fixed nav) by itself.
    lenis.scrollTo(jump.target);
    focusSection(jump.target);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

export function startLenis(): Cleanup {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.09,
    smoothWheel: true,
    syncTouch: false,
    // The cookie preferences (vanilla-cookieconsent, S11) scroll natively, like data-lenis-prevent.
    prevent: (node) => node.closest('#cc-main') !== null,
  });
  lenis.on('scroll', ScrollTrigger.update);
  // A pin changes the height of the page without resizing <html>: WebKit's ResizeObserver does
  // not report it, and Lenis would keep its old limit (an anchor below the pin landed short).
  const resize = (): void => lenis.resize();
  ScrollTrigger.addEventListener('refresh', resize);
  const raf = (time: number): void => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  const cleanups = [pauseWithDialogs(lenis), handleAnchors(lenis)];
  return () => {
    for (const cleanup of cleanups) cleanup();
    ScrollTrigger.removeEventListener('refresh', resize);
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(...DEFAULT_LAG_SMOOTHING);
    lenis.destroy();
  };
}
