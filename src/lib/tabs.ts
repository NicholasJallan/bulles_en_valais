// Keyboard model of the tab lists (WAI-ARIA APG, horizontal tabs with automatic activation).

/** Index of the tab a key moves to, or `undefined` when the key does not move. */
export function nextTabIndex(key: string, current: number, count: number): number | undefined {
  if (count < 1) throw new RangeError('A tab list needs at least one tab');
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return undefined;
  }
}
