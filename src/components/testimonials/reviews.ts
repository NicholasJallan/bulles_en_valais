// Reviews cut short, shared by the native rail (rail.ts) and the pinned one (testimonials.ts): a
// review taller than the room it is given ends in a fade, with a button that opens it whole in a
// modal dialog. Its full text stays in the page for screen readers.
import type { Cleanup } from '@/lib/controllers.ts';

/** A review cut short keeps at least this much of its text. */
const MIN_QUOTE_PX = 96;

export interface Review {
  readonly card: HTMLElement;
  readonly quote: HTMLElement;
  readonly more: HTMLButtonElement;
}

export function findReviews(cards: readonly HTMLElement[]): Review[] {
  return cards.flatMap((card) => {
    const quote = card.querySelector<HTMLElement>('blockquote');
    const more = card.querySelector<HTMLButtonElement>('[data-review-open]');
    return quote && more ? [{ card, quote, more }] : [];
  });
}

export function unclamp({ card, quote, more }: Review): void {
  delete card.dataset.clamped;
  quote.style.removeProperty('max-block-size');
  more.hidden = true;
}

/** Cuts short every review whose card is taller than `room` px. */
export function clampTo(reviews: readonly Review[], room: number): void {
  for (const review of reviews) {
    unclamp(review);
    if (review.card.offsetHeight <= room) continue;
    review.card.dataset.clamped = '';
    review.more.hidden = false;
    const excess = review.card.offsetHeight - room;
    const height = Math.max(MIN_QUOTE_PX, review.quote.offsetHeight - excess);
    review.quote.style.maxBlockSize = `${height}px`;
  }
}

/** The review as written: without its cut, its quote mark or its button. */
function wholeReview(figure: Element): Node {
  const copy = figure.cloneNode(true) as Element;
  copy.querySelector('blockquote')?.removeAttribute('style');
  for (const extra of copy.querySelectorAll('[data-review-open], [data-rail-mark]')) extra.remove();
  return copy;
}

/** « Read the full review »: the whole review in a modal dialog; the focus comes back after. */
export function openReviews(section: HTMLElement): Cleanup {
  const dialog = section.querySelector<HTMLDialogElement>('[data-review-dialog]');
  const title = dialog?.querySelector<HTMLElement>('[data-review-title]');
  const body = dialog?.querySelector<HTMLElement>('[data-review-body]');
  if (!dialog || !title || !body) return () => undefined;
  let opener: HTMLElement | null = null;
  const onOpen = (event: MouseEvent): void => {
    const button =
      event.target instanceof Element ? event.target.closest('[data-review-open]') : null;
    const figure = button?.closest('figure');
    if (!(button instanceof HTMLElement) || !figure || dialog.open) return;
    title.textContent = figure.querySelector('.testimonial-author')?.textContent ?? '';
    body.replaceChildren(wholeReview(figure));
    opener = button;
    dialog.showModal();
  };
  const onDialogClick = (event: MouseEvent): void => {
    // A click on the backdrop lands on the dialog itself, outside its box.
    const box = dialog.getBoundingClientRect();
    const outside =
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom;
    const onBackdrop = event.target === dialog && outside;
    const onClose = event.target instanceof Element && event.target.closest('[data-review-close]');
    if (onBackdrop || onClose) dialog.close();
  };
  const onClose = (): void => {
    body.replaceChildren();
    opener?.focus();
    opener = null;
  };
  section.addEventListener('click', onOpen);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('close', onClose);
  return () => {
    section.removeEventListener('click', onOpen);
    dialog.removeEventListener('click', onDialogClick);
    dialog.removeEventListener('close', onClose);
    // The close event comes later: tidy up now.
    if (dialog.open) {
      dialog.close();
      onClose();
    }
  };
}
