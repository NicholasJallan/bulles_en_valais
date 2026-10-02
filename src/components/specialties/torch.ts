// The lamp of the Specialties (E8, S09): at 40 m the section is almost black; a warm beam follows
// the pointer, reveals the motes in suspension and lights the card under it. The keyboard puts it
// on the focused tab or panel, a finger where it touches; left alone, it drifts slowly. Started by
// the motion module: nothing of this under reduced motion or in calm mode. The text is readable
// without it: the beam lies under the content and only adds light.
import type { Cleanup } from '@/lib/controllers.ts';
import { DURATIONS_MS, seconds } from '@/lib/motion/tokens.ts';
import { driftPoint, litIndex, particleField, type Box } from '@/lib/torch/torch.ts';
import { gsap, ScrollTrigger } from '@/scripts/motion/gsap.ts';

/** Smoothing of the beam behind the pointer, in seconds (brief S09: ~0.15 s). */
const FOLLOW_S = 0.15;
/** Without a pointer for this long, the lamp starts drifting. */
const IDLE_MS = DURATIONS_MS.tide;
const DRIFT_S = seconds(DURATIONS_MS.tide) * 2;
/** The motes are drawn at a third of the resolution: out of focus, and cheap. */
const MOTES_SCALE = 1 / 3;
const MOTES_DENSITY = 0.0012;
const MOTES_SEED = 40;

interface Beam {
  readonly element: HTMLElement;
  readonly motes: HTMLCanvasElement;
}

function createBeam(section: HTMLElement): { layer: HTMLElement; beam: Beam } {
  const layer = document.createElement('div');
  layer.className = 'torch';
  layer.setAttribute('aria-hidden', 'true');
  const element = document.createElement('div');
  element.className = 'torch-beam';
  const motes = document.createElement('canvas');
  motes.className = 'torch-motes';
  element.append(motes);
  layer.append(element);
  section.prepend(layer);
  return { layer, beam: { element, motes } };
}

/** The motes of the whole section, drawn once at a low resolution (the beam shows a part). */
function drawMotes(canvas: HTMLCanvasElement, width: number, height: number): void {
  const context = canvas.getContext('2d');
  if (context === null) return;
  canvas.width = Math.max(1, Math.round(width * MOTES_SCALE));
  canvas.height = Math.max(1, Math.round(height * MOTES_SCALE));
  const foam = getComputedStyle(canvas).getPropertyValue('--c-foam').trim();
  context.fillStyle = foam;
  const field = { width: canvas.width, height: canvas.height, density: MOTES_DENSITY };
  for (const mote of particleField({ ...field, seed: MOTES_SEED })) {
    context.globalAlpha = mote.alpha;
    context.beginPath();
    context.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
    context.fill();
  }
}

/** Boxes of the cards of the shown panel, in the coordinates of the section. */
function measureCards(section: HTMLElement, cards: readonly HTMLElement[]): Box[] {
  const origin = section.getBoundingClientRect();
  return cards.map((card) => {
    const { left, top, right, bottom } = card.getBoundingClientRect();
    return {
      left: left - origin.left,
      top: top - origin.top,
      right: right - origin.left,
      bottom: bottom - origin.top,
    };
  });
}

interface Lamp {
  readonly position: { x: number; y: number };
  readonly geometry: { top: number; left: number; width: number; height: number; radius: number };
  readonly render: () => void;
  readonly measure: () => void;
  readonly follow: (x: number, y: number) => void;
  readonly switchOff: () => void;
}

/** The beam, where it is, and the card it lights. */
function createLamp(section: HTMLElement, cards: readonly HTMLElement[], beam: Beam): Lamp {
  const position = { x: 0, y: 0 };
  const geometry = { top: 0, left: 0, width: 0, height: 0, radius: 0 };
  let boxes: Box[] = [];
  let lit = -1;
  let drawn = '';
  const light = (index: number): void => {
    if (index === lit) return;
    cards[lit]?.classList.remove('is-lit');
    cards[index]?.classList.add('is-lit');
    lit = index;
  };
  const render = (): void => {
    const x = position.x - geometry.radius;
    const y = position.y - geometry.radius;
    beam.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    beam.motes.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
    light(litIndex(boxes, position.x, position.y));
  };
  const quick = { duration: FOLLOW_S, ease: 'surface', onUpdate: render };
  const followX = gsap.quickTo(position, 'x', quick);
  const followY = gsap.quickTo(position, 'y', quick);
  const measure = (): void => {
    const rect = section.getBoundingClientRect();
    Object.assign(geometry, {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      radius: beam.element.offsetWidth / 2,
    });
    beam.motes.style.width = `${rect.width}px`;
    beam.motes.style.height = `${rect.height}px`;
    // Drawn again only when the section changes size (a resize, another tab): never stretched.
    const size = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
    if (size !== drawn) {
      drawn = size;
      drawMotes(beam.motes, rect.width, rect.height);
    }
    boxes = measureCards(section, cards);
    render();
  };
  return {
    position,
    geometry,
    render,
    measure,
    follow: (x, y) => {
      followX(x);
      followY(y);
    },
    switchOff: () => light(-1),
  };
}

interface Drift {
  /** Someone holds the lamp: stop drifting, and start again after a while without input. */
  readonly hold: () => void;
  readonly setInView: (inView: boolean) => void;
  readonly stop: () => void;
}

/** Left alone, the lamp wanders over the visible part of the section. */
function createDrift(lamp: Lamp): Drift {
  const { position, geometry } = lamp;
  let tween: gsap.core.Tween | undefined;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let inView = false;
  const visibleArea = (): Box => ({
    left: 0,
    right: geometry.width,
    top: Math.max(0, window.scrollY - geometry.top),
    bottom: Math.min(geometry.height, window.scrollY + window.innerHeight - geometry.top),
  });
  const wander = (): void => {
    if (!inView) return;
    tween = gsap.to(position, {
      ...driftPoint(Math.random, visibleArea(), geometry.radius / 2),
      duration: DRIFT_S,
      ease: 'drift',
      onUpdate: lamp.render,
      onComplete: wander,
    });
  };
  const stop = (): void => {
    tween?.kill();
    tween = undefined;
    clearTimeout(idle);
  };
  const hold = (): void => {
    stop();
    idle = setTimeout(wander, IDLE_MS);
  };
  return {
    hold,
    stop,
    setInView(value) {
      inView = value;
      if (inView) hold();
      else stop();
    },
  };
}

/** Pointer, touch and keyboard; also keeps the lamp under a still pointer while the page scrolls. */
function listen(section: HTMLElement, lamp: Lamp, drift: Drift): Cleanup {
  let pointer: { x: number; y: number } | undefined;
  const aimAtClient = (clientX: number, clientY: number): void => {
    drift.hold();
    lamp.follow(
      clientX + window.scrollX - lamp.geometry.left,
      clientY + window.scrollY - lamp.geometry.top,
    );
  };
  const onPointer = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' && event.type === 'pointermove') return;
    pointer = event.pointerType === 'touch' ? undefined : { x: event.clientX, y: event.clientY };
    aimAtClient(event.clientX, event.clientY);
  };
  const onLeave = (): void => {
    pointer = undefined;
  };
  const onFocus = (event: FocusEvent): void => {
    if (!(event.target instanceof HTMLElement)) return;
    // A panel has no focus of its own to show: the lamp settles on its first card.
    const spot = event.target.querySelector<HTMLElement>('[data-torch-card]') ?? event.target;
    const { left, top, width, height } = spot.getBoundingClientRect();
    aimAtClient(left + width / 2, top + height / 2);
  };
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onRefresh: lamp.measure,
    onToggle: (self) => drift.setInView(self.isActive),
    onUpdate() {
      if (pointer !== undefined) aimAtClient(pointer.x, pointer.y);
    },
  });
  const listeners = [
    ['pointermove', onPointer],
    ['pointerdown', onPointer],
    ['pointerleave', onLeave],
    ['focusin', onFocus],
  ] as const;
  for (const [type, listener] of listeners)
    section.addEventListener(type, listener as EventListener);
  return () => {
    trigger.kill();
    for (const [type, listener] of listeners) {
      section.removeEventListener(type, listener as EventListener);
    }
  };
}

export function startTorch(): Cleanup {
  const section = document.getElementById('specialties');
  if (section === null) return () => undefined;
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-torch-card]'));
  const { layer, beam } = createBeam(section);
  section.dataset.torch = '';
  const lamp = createLamp(section, cards, beam);
  const drift = createDrift(lamp);
  lamp.measure();
  lamp.position.x = lamp.geometry.width / 2;
  lamp.position.y = Math.min(lamp.geometry.height / 2, window.innerHeight / 2);
  lamp.render();
  const stopListening = listen(section, lamp, drift);
  return () => {
    stopListening();
    drift.stop();
    gsap.killTweensOf(lamp.position);
    lamp.switchOff();
    layer.remove();
    delete section.dataset.torch;
  };
}
