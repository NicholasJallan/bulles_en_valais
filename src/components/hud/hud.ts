// Depth gauge (E3). Coarse on its own (the section in the middle of the viewport, through an
// IntersectionObserver), precise once the motion module feeds it readings from ScrollTrigger.
// S08 (depth ladder) and S10 (safety stop) switch its mode with setMode().
import type { Cleanup } from '@/lib/controllers.ts';
import { HUD_PROFILE } from '@/data/sections.ts';
import { isFastAscent, type DepthSample } from '@/lib/depth/ascent.ts';
import { profilePoint } from '@/lib/depth/profile.ts';
import type { DepthReading } from '@/lib/depth/resolve-depth.ts';
import { temperatureAt } from '@/lib/depth/temperature.ts';
import { formatDecimal, formatDuration, formatTemperature } from '@/lib/format.ts';
import { LOCALES, type Locale } from '@/i18n/types.ts';
import { PROFILE_GEOMETRY, profileIndex } from './profile-geometry.ts';

import { SECTION_EVENT, type SectionDetail } from './events.ts';

export type HudMode = 'normal' | 'hidden' | 'safety-stop';

/** The « ▲ SLOW » ascent alarm is behind a flag, off by default (S06 brief). */
const ASCENT_ALARM = false;
const ALARM_MS = 1200;
const SAFETY_STOP_S = 180;
const SAFETY_STOP_DEPTH = 5;
const TICK_MS = 1000;

interface Hud {
  show(reading: DepthReading, precise: boolean): void;
  setMode(mode: HudMode | null): void;
  release(): void;
}

let current: Hud | undefined;

/** Forces a mode (`null` gives the control back to the sections: hidden in the depth ladder). */
export function setMode(mode: HudMode | null): void {
  current?.setMode(mode);
}

/** A reading from the motion module: from then on, the coarse tracking stops. */
export function showReading(reading: DepthReading): void {
  current?.show(reading, true);
}

/** The motion module stopped (reduced motion asked meanwhile): back to the coarse tracking. */
export function releaseReadings(): void {
  current?.release();
}

const toLocale = (value: string | undefined): Locale =>
  LOCALES.find((locale) => locale === value) ?? 'fr';

function slot(root: HTMLElement, name: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[data-hud-${name}]`);
  if (element === null) throw new Error(`hud: [data-hud-${name}] missing`);
  return element;
}

/** Writes a text only when it changes: the gauge is updated on every scrolled frame. */
function writer(element: HTMLElement): (text: string) => void {
  let last = element.textContent ?? '';
  return (text) => {
    if (text === last) return;
    last = text;
    element.textContent = text;
  };
}

/** Coarse tracking: the section crossing the middle of the viewport, at its start depth. */
function observeSections(onReading: (reading: DepthReading) => void): Cleanup {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-depth-start]'));
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.find((candidate) => candidate.isIntersecting);
      if (entry === undefined) return;
      const element = entry.target as HTMLElement;
      onReading({
        id: element.id,
        index: sections.indexOf(element),
        progress: 0,
        depth: Number(element.dataset.depthStart),
        hidden: element.dataset.hud === 'hidden',
      });
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  for (const section of sections) observer.observe(section);
  return () => observer.disconnect();
}

function createHud(root: HTMLElement): Hud & { destroy: Cleanup } {
  const locale = toLocale(root.dataset.locale);
  const depth = writer(slot(root, 'depth'));
  const temperature = writer(slot(root, 'temperature'));
  const time = writer(slot(root, 'time'));
  const alarm = slot(root, 'alarm');
  const alarmText = writer(slot(root, 'alarm-text'));
  const dots = Array.from(document.querySelectorAll<SVGElement>('[data-hud-dot]'));
  const startedAt = performance.now();

  let precise = false;
  let override: HudMode | null = null;
  let reading: DepthReading | undefined;
  let section = '';
  let stopStartedAt = 0;
  let sample: DepthSample | undefined;
  let alarmTimer = 0;

  const mode = (): HudMode => override ?? (reading?.hidden ? 'hidden' : 'normal');

  const renderAlarm = (): void => {
    const safetyStop = mode() === 'safety-stop';
    if (safetyStop) {
      const left = Math.max(0, SAFETY_STOP_S - (performance.now() - stopStartedAt) / 1000);
      const label = root.dataset.labelSafetyStop ?? '';
      alarmText(
        `${label} ${formatDecimal(SAFETY_STOP_DEPTH, locale, 0)} m · ${formatDuration(left)}`,
      );
    } else if (root.dataset.alarm === 'ascent') {
      alarmText(`▲ ${(root.dataset.labelSlowAscent ?? '').toLocaleUpperCase(locale)}`);
    }
    alarm.hidden = !safetyStop && root.dataset.alarm !== 'ascent';
  };

  const ringAscentAlarm = (): void => {
    root.dataset.alarm = 'ascent';
    window.clearTimeout(alarmTimer);
    alarmTimer = window.setTimeout(() => {
      delete root.dataset.alarm;
      renderAlarm();
    }, ALARM_MS);
  };

  const checkAscent = (value: number): void => {
    if (!ASCENT_ALARM) return;
    const now = { depth: value, time: performance.now() };
    if (sample !== undefined && isFastAscent(sample, now)) ringAscentAlarm();
    if (sample === undefined || now.time - sample.time > 250) sample = now;
  };

  const renderDots = (value: number): void => {
    if (reading === undefined) return;
    const index = profileIndex(reading.id);
    if (index < 0) return;
    const { x, y } = profilePoint(PROFILE_GEOMETRY, index, reading.progress, value);
    for (const dot of dots) dot.setAttribute('transform', `translate(${x} ${y})`);
  };

  const render = (): void => {
    const value = mode() === 'safety-stop' ? SAFETY_STOP_DEPTH : (reading?.depth ?? 0);
    root.dataset.mode = mode();
    depth(formatDecimal(value, locale));
    temperature(formatTemperature(temperatureAt(value), locale));
    renderDots(value);
    renderAlarm();
  };

  const announceSection = (id: string): void => {
    if (id === section) return;
    section = id;
    document.dispatchEvent(new CustomEvent<SectionDetail>(SECTION_EVENT, { detail: { id } }));
  };

  const tick = (): void => {
    if (document.hidden) return;
    time(formatDuration((performance.now() - startedAt) / 1000));
    if (mode() === 'safety-stop') renderAlarm();
  };
  const interval = window.setInterval(tick, TICK_MS);

  const show = (next: DepthReading, fromMotion: boolean): void => {
    if (fromMotion) precise = true;
    else if (precise) return;
    reading = next;
    checkAscent(next.depth);
    announceSection(next.id);
    render();
  };
  const stopObserving = observeSections((next) => show(next, false));

  return {
    show,
    setMode(next) {
      if (next === 'safety-stop' && override !== 'safety-stop') stopStartedAt = performance.now();
      override = next;
      render();
    },
    release() {
      precise = false;
    },
    destroy() {
      stopObserving();
      window.clearInterval(interval);
      window.clearTimeout(alarmTimer);
    },
  };
}

/** Closes the dive profile when one of its links is followed. */
function closeProfileOnLink(): Cleanup {
  const popover = document.getElementById('dive-profile');
  if (popover === null) return () => undefined;
  const onClick = (event: MouseEvent): void => {
    const link =
      event.target instanceof Element ? event.target.closest('[data-profile-link]') : null;
    if (link !== null && popover.matches(':popover-open')) popover.hidePopover();
  };
  popover.addEventListener('click', onClick);
  return () => popover.removeEventListener('click', onClick);
}

/** Marks the current section in the dive profile. */
function followSections(): Cleanup {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-profile-link]'));
  const onSection = (event: Event): void => {
    const { id } = (event as CustomEvent<SectionDetail>).detail;
    for (const link of links) {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  document.addEventListener(SECTION_EVENT, onSection);
  return () => document.removeEventListener(SECTION_EVENT, onSection);
}

export function init(root: HTMLElement): Cleanup {
  // The first reading comes from the observer: start at the top of the profile meanwhile.
  const first = HUD_PROFILE[0];
  const unfollow = followSections();
  const hud = createHud(root);
  if (first !== undefined) {
    hud.show({ id: first.id, index: 0, progress: 0, depth: first.start, hidden: false }, false);
  }
  current = hud;
  const unbind = closeProfileOnLink();
  return () => {
    unbind();
    unfollow();
    hud.destroy();
    if (current === hud) current = undefined;
  };
}
