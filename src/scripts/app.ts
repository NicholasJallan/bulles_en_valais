// Single entry point, imported by BaseLayout (plans/refonte-la-descente/02-architecture.md §7).
import { mountControllers, type ControllerRegistry } from '@/lib/controllers.ts';

/** `data-controller` name → module exporting `init(element)`, loaded on demand. */
const CONTROLLERS: ControllerRegistry = {};

void mountControllers(document, CONTROLLERS, (error, name) => {
  console.error(`Controller "${name}" failed to start`, error);
});
