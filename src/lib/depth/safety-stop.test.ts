import { describe, expect, it } from 'vitest';
import { SAFETY_STOP_S, idleStop, pauseStop, remainingSeconds, resumeStop } from './safety-stop.ts';

describe('safety stop clock', () => {
  it('starts at three minutes, idle', () => {
    expect(SAFETY_STOP_S).toBe(180);
    expect(remainingSeconds(idleStop(), 5000)).toBe(180);
  });

  it('counts down while running', () => {
    const running = resumeStop(idleStop(), 1000);
    expect(remainingSeconds(running, 1000)).toBe(180);
    expect(remainingSeconds(running, 31_000)).toBe(150);
  });

  it('holds its time while paused, then carries on', () => {
    const paused = pauseStop(resumeStop(idleStop(), 0), 60_000);
    expect(remainingSeconds(paused, 500_000)).toBe(120);
    const again = resumeStop(paused, 500_000);
    expect(remainingSeconds(again, 510_000)).toBe(110);
  });

  it('stops at zero', () => {
    expect(remainingSeconds(resumeStop(idleStop(), 0), 400_000)).toBe(0);
  });

  it('ignores a resume while running and a pause while paused', () => {
    const running = resumeStop(idleStop(), 0);
    expect(resumeStop(running, 50_000)).toBe(running);
    const paused = pauseStop(running, 10_000);
    expect(pauseStop(paused, 90_000)).toBe(paused);
  });

  it('never changes the state it is given', () => {
    const idle = idleStop();
    resumeStop(idle, 10);
    expect(idle).toEqual(idleStop());
  });
});
