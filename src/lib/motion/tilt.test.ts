import { describe, expect, it } from 'vitest';
import { TILT_MAX_DEG, tiltAt } from './tilt.ts';

const card = { left: 100, top: 50, width: 400, height: 250 };

describe('tiltAt', () => {
  it('leaves the card flat with the pointer at its centre', () => {
    expect(tiltAt(card, 300, 175)).toEqual({ rotateX: 0, rotateY: 0, sheenX: 0, sheenY: 0 });
  });

  it('turns the card towards a pointer on its right edge, by the maximum', () => {
    const tilt = tiltAt(card, 500, 175);
    expect(tilt.rotateY).toBe(TILT_MAX_DEG);
    expect(tilt.rotateX).toBe(0);
    // The reflection slides the other way, like light on a turning surface.
    expect(tilt.sheenX).toBe(-1);
  });

  it('tips the top edge back for a pointer near the top', () => {
    const tilt = tiltAt(card, 300, 50);
    expect(tilt.rotateX).toBe(TILT_MAX_DEG);
    expect(tilt.sheenY).toBe(1);
  });

  it('never goes past the maximum, even with the pointer outside the card', () => {
    const tilt = tiltAt(card, -1000, 2000);
    expect(tilt.rotateY).toBe(-TILT_MAX_DEG);
    expect(tilt.rotateX).toBe(-TILT_MAX_DEG);
    expect(Math.abs(tilt.sheenX)).toBe(1);
  });

  it('stays flat for an empty box', () => {
    expect(tiltAt({ left: 0, top: 0, width: 0, height: 0 }, 10, 10).rotateY).toBe(0);
  });

  it('takes another maximum', () => {
    expect(tiltAt(card, 500, 175, 4).rotateY).toBe(4);
  });
});
