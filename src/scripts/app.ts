// Single entry point, imported by BaseLayout (plans/refonte-la-descente/02-architecture.md §7).
import { mountControllers, type ControllerRegistry } from '@/lib/controllers.ts';

/** `data-controller` name → module exporting `init(element)`, loaded on demand. */
const CONTROLLERS: ControllerRegistry = {
  // Styleguide only (S02): removed with it in S13.
  'styleguide-switch': () => import('@/components/styleguide/switch.ts'),
  'styleguide-motion': () => import('@/components/styleguide/motion.ts'),
};

void mountControllers(document, CONTROLLERS, (error, name) => {
  console.error(`Controller "${name}" failed to start`, error);
});
