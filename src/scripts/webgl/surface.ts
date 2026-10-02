// The living surface of the hero (E1, E2; 02-architecture.md §9), loaded on demand by hero.ts.
// OGL draws one triangle; the loop runs on gsap.ticker only while the canvas is on screen and
// the tab is visible. A lost context hands the hero back to its <img>.
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';
import { COLORS, type ColorName } from '@/lib/color/palette.ts';
import { oklchToSrgb } from '@/lib/color/contrast.ts';
import {
  lakeUniforms,
  pointerToWater,
  windUniforms,
  type Cover,
  type MaskPixels,
} from '@/lib/webgl/lake.ts';
import {
  MAX_RIPPLES,
  addRipple,
  liveRipples,
  ringWave,
  writeRipples,
  type Ripple,
} from '@/lib/webgl/ripples.ts';
import { coverTransform, surfaceDpr, type FocalPoint } from '@/lib/webgl/viewport.ts';
import lake from '@/lib/webgl/shaders/lake.glsl?raw';
import fragmentSource from '@/lib/webgl/shaders/surface.frag?raw';
import noise from '@/lib/webgl/shaders/noise.glsl?raw';
import vertex from '@/lib/webgl/shaders/surface.vert?raw';
import { gsap } from '../motion/gsap.ts';

export interface SurfaceOptions {
  readonly canvas: HTMLCanvasElement;
  /** The decoded hero <img>: its current source is the texture. */
  readonly image: HTMLImageElement;
  /** water-mask.png, decoded: white where the photo shows water. */
  readonly mask: HTMLImageElement;
  /** object-position of the <img>, so that the shader frames the photo the same way. */
  readonly focal: FocalPoint;
  /** Phones render at 3/4 of the resolution. */
  readonly mobile: boolean;
  /** The GPU dropped the context: the caller removes the canvas. */
  readonly onContextLost: () => void;
}

export interface Surface {
  /** 0 above the surface, 1 once the water line has crossed the screen (E2). */
  setImmersion(value: number): void;
  /** A ripple where a point of the viewport (CSS pixels) shows the lake; nothing elsewhere. */
  addRipple(clientX: number, clientY: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
}

// The size of uRipples comes from ripples.ts, so that the two never disagree.
const fragment = fragmentSource
  .replace('#include <noise>', noise)
  .replace('#include <lake>', `#define MAX_RIPPLES ${MAX_RIPPLES}\n${lake}`);

const rgb = (name: ColorName): [number, number, number] => {
  const { r, g, b } = oklchToSrgb(COLORS[name]);
  return [r, g, b];
};

const seconds = (): number => performance.now() / 1000;
/** The water moves slowly: 60 frames per second at most, even on 120 Hz screens. */
const MIN_FRAME_S = 1 / 62;

/** The mask's pixels, read once to test the pointer on the CPU; without them, no rings. */
function readMask(mask: HTMLImageElement): MaskPixels | undefined {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = mask.naturalWidth;
    canvas.height = mask.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context === null) return undefined;
    context.drawImage(mask, 0, 0);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return undefined;
  }
}

function linearTexture(gl: Renderer['gl'], image: HTMLImageElement): Texture {
  return new Texture(gl, {
    image,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });
}

/** Throws when the context or the program cannot be created: the caller keeps the <img>. */
export function createSurface(options: SurfaceOptions): Surface {
  const { canvas, mobile } = options;
  const renderer = new Renderer({
    canvas,
    dpr: surfaceDpr(window.devicePixelRatio, mobile),
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  const { gl } = renderer;
  try {
    return mountSurface(options, renderer);
  } catch (error) {
    // The context exists already: give it back before the caller keeps the <img>.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    throw error;
  }
}

function mountSurface(options: SurfaceOptions, renderer: Renderer): Surface {
  const { canvas, image, mask, focal, onContextLost } = options;
  const box = canvas.parentElement ?? canvas;
  const { gl } = renderer;
  if (!(gl instanceof WebGL2RenderingContext)) throw new Error('WebGL 2 unavailable');

  // A plain array: OGL only resolves uRipples[0] on an Array value.
  const ripplesBuffer = Array.from({ length: MAX_RIPPLES * 3 }, () => 0);
  const camera = lakeUniforms();
  const wind = windUniforms();
  const maskPixels = readMask(mask);
  const uniforms = {
    uImage: { value: linearTexture(gl, image) },
    uMask: { value: linearTexture(gl, mask) },
    uTime: { value: 0 },
    uImmersion: { value: 0 },
    uResolution: { value: [1, 1] },
    uRipples: { value: ripplesBuffer },
    uCoverScale: { value: [1, 1] },
    uCoverOffset: { value: [0, 0] },
    uLakeLens: { value: camera.lens },
    uLakeCamera: { value: camera.camera },
    uRingWave: { value: ringWave() },
    uWindWaves: { value: wind.wavelengths },
    uWindDrift: { value: wind.drift },
    uTint: { value: rgb('lagoon-ink') },
    uDeep: { value: rgb('deep') },
    uLight: { value: rgb('foam') },
  };
  const program = new Program(gl, { vertex, fragment, uniforms, depthTest: false });
  if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
    throw new Error('Surface shader failed to compile');
  }
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const startedAt = seconds();
  let ripples: readonly Ripple[] = [];
  let cover: Cover = { scale: [1, 1], offset: [0, 0] };
  let started = false;
  let onScreen = true;
  let looping = false;

  const now = (): number => seconds() - startedAt;

  let lastFrame = -1;
  const render = (): void => {
    const time = now();
    lastFrame = time;
    ripples = liveRipples(ripples, time);
    writeRipples(ripples, time, ripplesBuffer);
    uniforms.uTime.value = time;
    renderer.render({ scene: mesh });
  };

  const resize = (): void => {
    const width = box.clientWidth;
    const height = box.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height);
    uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    cover = coverTransform(
      { width: image.naturalWidth, height: image.naturalHeight },
      { width, height },
      focal,
    );
    uniforms.uCoverScale.value = [...cover.scale];
    uniforms.uCoverOffset.value = [...cover.offset];
    if (!looping) render();
  };

  const tick = (): void => {
    if (now() - lastFrame >= MIN_FRAME_S) render();
  };

  const sync = (): void => {
    const run = started && onScreen && document.visibilityState === 'visible';
    if (run === looping) return;
    looping = run;
    if (run) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  };

  const intersection = new IntersectionObserver((entries) => {
    onScreen = entries.at(-1)?.isIntersecting ?? false;
    sync();
  });
  const resizeObserver = new ResizeObserver(resize);
  const onContext = (event: Event): void => {
    event.preventDefault();
    destroy();
    onContextLost();
  };

  intersection.observe(canvas);
  resizeObserver.observe(box);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', onContext);
  resize();

  function destroy(): void {
    started = false;
    sync();
    intersection.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    canvas.removeEventListener('webglcontextlost', onContext);
  }

  return {
    setImmersion(value) {
      uniforms.uImmersion.value = Math.min(1, Math.max(0, value));
      if (!looping) render();
    },
    addRipple(clientX, clientY) {
      if (maskPixels === undefined) return;
      const rect = canvas.getBoundingClientRect();
      const water = pointerToWater({ x: clientX, y: clientY }, rect, cover, maskPixels);
      if (water !== undefined)
        ripples = addRipple(ripples, { x: water.x, z: water.z, born: now() });
    },
    start() {
      started = true;
      sync();
    },
    stop() {
      started = false;
      sync();
    },
    destroy() {
      destroy();
      // Give the context back at once: browsers cap the live ones.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
