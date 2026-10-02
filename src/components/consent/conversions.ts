// Conversion clicks (02-architecture.md §12): a phone link, or a wa.me link that leaves for
// WhatsApp. The links that only open the WhatsApp dialog (data-whatsapp-open) are not a
// conversion; the « Open WhatsApp » link of the dialog is. The sent form is tracked by
// contact-form.ts.
import { trackPhone, trackWhatsApp } from '@/lib/analytics/events.ts';
import type { Cleanup } from '@/lib/controllers.ts';

function onClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href]');
  if (link === null) return;
  const href = link.getAttribute('href') ?? '';
  if (href.startsWith('tel:')) trackPhone();
  else if (href.startsWith('https://wa.me/') && !link.hasAttribute('data-whatsapp-open')) {
    trackWhatsApp();
  }
}

export function listenForConversions(root: Document): Cleanup {
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
