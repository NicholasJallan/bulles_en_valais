// The safety stop of the FAQ (E13): three minutes at 5 m, counted down while the section is in
// view, paused out of it. Immutable states, times in milliseconds (performance.now()).

export const SAFETY_STOP_S = 180;

export interface StopClock {
  /** Time spent at the stop before the current run, in ms. */
  readonly spentMs: number;
  /** When the current run started, or null while paused. */
  readonly since: number | null;
}

export const idleStop = (): StopClock => ({ spentMs: 0, since: null });

export function resumeStop(clock: StopClock, now: number): StopClock {
  return clock.since === null ? { ...clock, since: now } : clock;
}

export function pauseStop(clock: StopClock, now: number): StopClock {
  return clock.since === null ? clock : { spentMs: clock.spentMs + now - clock.since, since: null };
}

/** Whole seconds left, from 180 down to 0. */
export function remainingSeconds(clock: StopClock, now: number): number {
  const spent = clock.spentMs + (clock.since === null ? 0 : now - clock.since);
  return Math.max(0, Math.ceil(SAFETY_STOP_S - spent / 1000));
}
