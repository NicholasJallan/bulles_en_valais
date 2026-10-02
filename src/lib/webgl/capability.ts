// Whether the hero may run its WebGL surface (E1, 02-architecture.md §9). The environment is
// injected so that the decision is tested without a browser.

export interface WebGLEnvironment {
  /** html.motion-ok: no reduced motion asked, no calm mode. */
  readonly motionAllowed: boolean;
  /** Creates a WebGL 2 context: only called once every cheaper check passed. */
  readonly hasWebGL2: () => boolean;
  readonly saveData: boolean;
  /** Gigabytes (Chromium only), undefined when the browser does not tell. */
  readonly deviceMemory: number | undefined;
  readonly hardwareConcurrency: number | undefined;
}

const MIN_MEMORY_GB = 4;
const MIN_CORES = 4;

const atLeast = (value: number | undefined, minimum: number): boolean =>
  value === undefined || value >= minimum;

export function canUseWebGL(env: WebGLEnvironment): boolean {
  return (
    env.motionAllowed &&
    !env.saveData &&
    atLeast(env.deviceMemory, MIN_MEMORY_GB) &&
    atLeast(env.hardwareConcurrency, MIN_CORES) &&
    env.hasWebGL2()
  );
}

/** The parts of `document` and `navigator` the decision reads (fakes in the tests). */
interface DocumentLike {
  readonly documentElement: { readonly classList: { contains(name: string): boolean } };
  createElement(tag: 'canvas'): { getContext(type: string): unknown };
}

interface NavigatorLike {
  readonly connection?: { readonly saveData?: boolean };
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
}

interface ProbedContext {
  getExtension(name: 'WEBGL_lose_context'): { loseContext(): void } | null;
}

function probeWebGL2(doc: DocumentLike): boolean {
  try {
    const context = doc.createElement('canvas').getContext('webgl2') as ProbedContext | null;
    if (context === null) return false;
    // Browsers cap the live contexts: give this one back before the surface creates its own.
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function readEnvironment(doc: DocumentLike, nav: NavigatorLike): WebGLEnvironment {
  return {
    motionAllowed: doc.documentElement.classList.contains('motion-ok'),
    hasWebGL2: () => probeWebGL2(doc),
    saveData: nav.connection?.saveData === true,
    deviceMemory: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  };
}
