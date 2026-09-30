export type Cleanup = () => void;

/** A controller module: `init` wires an element and returns what undoes it. */
export interface Controller {
  init(element: HTMLElement): Cleanup;
}

export type ControllerRegistry = Readonly<Record<string, () => Promise<Controller>>>;
export type ErrorReporter = (error: unknown, name: string) => void;

const SELECTOR = '[data-controller]';

function controllerNames(element: HTMLElement): string[] {
  return (element.dataset.controller ?? '').split(/\s+/).filter((name) => name !== '');
}

/** A cleanup that reports its own failure instead of stopping the next ones. */
function guarded(cleanup: Cleanup, name: string, report: ErrorReporter): Cleanup {
  return () => {
    try {
      cleanup();
    } catch (error) {
      report(error, name);
    }
  };
}

async function mount(
  element: HTMLElement,
  name: string,
  registry: ControllerRegistry,
  report: ErrorReporter,
): Promise<Cleanup | undefined> {
  const load = Object.hasOwn(registry, name) ? registry[name] : undefined;
  if (load === undefined) {
    report(new Error(`Unknown controller "${name}"`), name);
    return undefined;
  }
  try {
    const controller = await load();
    return guarded(controller.init(element), name, report);
  } catch (error) {
    report(error, name);
    return undefined;
  }
}

/**
 * Loads and starts the controllers named by `data-controller` under `root`
 * (several names are separated by spaces). A failing controller, or a failing
 * cleanup, is reported and does not stop the others.
 */
export async function mountControllers(
  root: ParentNode,
  registry: ControllerRegistry,
  report: ErrorReporter,
): Promise<Cleanup> {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR));
  const mounted = await Promise.all(
    elements.flatMap((element) =>
      controllerNames(element).map((name) => mount(element, name, registry, report)),
    ),
  );
  const cleanups = mounted.filter((cleanup): cleanup is Cleanup => cleanup !== undefined);
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
