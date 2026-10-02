// Cascade of the items of a tab panel (S08, S09): one step between the items, tightened so that
// the last item has settled within the time allowed (0.6 s for the specialty cards).

export interface Cascade {
  readonly count: number;
  /** Usual delay between two items, in ms. */
  readonly step: number;
  /** Duration of the entrance of one item, in ms. */
  readonly duration: number;
  /** Time by which the last item must have settled, in ms. */
  readonly total: number;
}

/** The delay between two items, in ms. */
export function cascadeStagger({ count, step, duration, total }: Cascade): number {
  if (count < 2) return 0;
  return Math.max(0, Math.min(step, (total - duration) / (count - 1)));
}
