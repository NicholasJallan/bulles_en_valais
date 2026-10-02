// Single entry point, imported by BaseLayout (plans/refonte-la-descente/02-architecture.md §7).
import { mountControllers, type ControllerRegistry } from '@/lib/controllers.ts';

/** `data-controller` name → module exporting `init(element)`, loaded on demand. */
const CONTROLLERS: ControllerRegistry = {
  nav: () => import('@/components/nav/nav.ts'),
  tabs: () => import('@/components/ui/tabs.ts'),
  rail: () => import('@/components/testimonials/rail.ts'),
  'contact-form': () => import('@/components/contact/contact-form.ts'),
  whatsapp: () => import('@/components/whatsapp/whatsapp.ts'),
  'calm-mode': () => import('@/components/calm/calm-mode.ts'),
  hud: () => import('@/components/hud/hud.ts'),
  'safety-stop': () => import('@/components/faq/safety-stop.ts'),
  // Consent banner and conversion clicks (S11): the library is loaded with the controller.
  consent: () => import('@/components/consent/consent.ts'),
};

const root = document.documentElement;
// The motion module downloads alongside the controllers, and starts once they are ready: tabs
// and panels must have their final height before ScrollTrigger measures the page.
// A failed download is kept as a value, reported by startMotion (no unhandled rejection).
const motion = root.classList.contains('motion-ok')
  ? import('./motion/index.ts').then(
      (module) => ({ module }),
      (error: unknown) => ({ error }),
    )
  : undefined;

async function startMotion(): Promise<void> {
  if (motion === undefined) return;
  const loaded = await motion;
  try {
    if ('error' in loaded) throw loaded.error;
    loaded.module.startMotion();
  } catch (error) {
    console.error('Motion failed to start', error);
    // Show everything the motion module would have revealed.
    root.classList.remove('motion-ok', 'motion-ready');
  }
}

void mountControllers(document, CONTROLLERS, (error, name) => {
  console.error(`Controller "${name}" failed to start`, error);
  // A controller that does not start must not leave a half-enhanced page (tabs hiding their
  // panels, a disabled submit): fall back to the page as served without JavaScript.
  root.classList.remove('js');
}).then(async () => {
  // Lets the end-to-end tests wait for the controllers.
  root.dataset.controllers = 'ready';
  await startMotion();
});
