import { describe, expect, it } from 'vitest';
import { customProperties } from './custom-properties.ts';

const CSS = `
/* Raw colours */
:root {
  --c-ink: oklch(21% 0.03 240); /* text on light */
  --space-s: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  color: red;
}

:root,
[data-tone="surface"] {
  --bg: var(--c-surface);
}

[data-tone='deep'] {
  --bg: var(--c-deep);
  --fg: var(--c-foam);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-base: 0ms;
  }
}

:root {
  --c-ink: oklch(20% 0.03 240);
}
`;

describe('customProperties', () => {
  it('reads the custom properties of the top-level blocks of a selector, in cascade order', () => {
    expect(customProperties(CSS, ':root')).toEqual(
      new Map([
        ['--c-ink', 'oklch(20% 0.03 240)'],
        ['--space-s', 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)'],
        ['--bg', 'var(--c-surface)'],
      ]),
    );
  });

  it('matches one selector of a selector list, whatever the quotes', () => {
    expect(customProperties(CSS, "[data-tone='surface']")).toEqual(
      new Map([['--bg', 'var(--c-surface)']]),
    );
    expect(customProperties(CSS, '[data-tone="deep"]')).toEqual(
      new Map([
        ['--bg', 'var(--c-deep)'],
        ['--fg', 'var(--c-foam)'],
      ]),
    );
  });

  it('ignores the blocks nested in at-rules and the regular properties', () => {
    const root = customProperties(CSS, ':root');
    expect(root.has('--dur-base')).toBe(false);
    expect(root.has('color')).toBe(false);
  });

  it('returns an empty map for an unknown selector', () => {
    expect(customProperties(CSS, '.missing').size).toBe(0);
  });
});
