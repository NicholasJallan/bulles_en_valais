// WhatsApp dialog: opened by any [data-whatsapp-open] link, the focus in the message; it builds
// the wa.me link from the message being written; the focus goes back to the opener when it closes
// (Escape included). Lenis stops while it is open (lenis.ts).
import { whatsappUrl } from '@/data/contact.ts';
import type { Cleanup } from '@/lib/controllers.ts';

export function init(element: HTMLElement): Cleanup {
  const dialog = element.querySelector<HTMLDialogElement>('dialog');
  const message = element.querySelector<HTMLTextAreaElement>('[data-whatsapp-message]');
  const send = element.querySelector<HTMLAnchorElement>('[data-whatsapp-send]');
  if (dialog === null || message === null || send === null)
    throw new Error('whatsapp: parts missing');
  const defaultMessage = element.dataset.defaultMessage ?? '';
  let opener: HTMLElement | null = null;
  const openers = document.querySelectorAll('[data-whatsapp-open]');
  for (const link of openers) link.setAttribute('aria-haspopup', 'dialog');

  const onOpen = (event: MouseEvent) => {
    const link =
      event.target instanceof Element ? event.target.closest('[data-whatsapp-open]') : null;
    if (!(link instanceof HTMLElement)) return;
    // Ctrl, Cmd or Shift: the visitor wants wa.me in a new tab or window, let the link work.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    opener = link;
    dialog.showModal();
    // Straight to writing: the close button would otherwise take the first focus.
    message.focus();
  };
  const onInput = () => {
    send.href = whatsappUrl(message.value.trim() || defaultMessage);
  };
  const isOnBackdrop = (event: MouseEvent) => {
    // A click on the backdrop lands on the dialog itself, outside its box.
    const box = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    return event.target === dialog && !inside;
  };
  const onDialogClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (isOnBackdrop(event) || target?.closest('[data-whatsapp-close], [data-whatsapp-send]')) {
      dialog.close();
    }
  };
  const onClose = () => {
    opener?.focus();
    opener = null;
  };

  document.addEventListener('click', onOpen);
  message.addEventListener('input', onInput);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('close', onClose);
  return () => {
    document.removeEventListener('click', onOpen);
    message.removeEventListener('input', onInput);
    dialog.removeEventListener('click', onDialogClick);
    dialog.removeEventListener('close', onClose);
    for (const link of openers) link.removeAttribute('aria-haspopup');
    if (dialog.open) dialog.close();
  };
}
