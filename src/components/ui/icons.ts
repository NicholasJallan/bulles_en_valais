// Stroke icons drawn for this site on a 24 × 24 grid (no third-party icon set, no licence to track).
export const ICONS = {
  'arrow-left': ['M19.5 12h-15', 'M10 6.5L4.5 12l5.5 5.5'],
  'arrow-right': ['M4.5 12h15', 'M14 6.5l5.5 5.5-5.5 5.5'],
  'arrow-up': ['M12 19.5v-15', 'M6.5 10L12 4.5l5.5 5.5'],
  'arrow-down': ['M12 4.5v15', 'M6.5 14l5.5 5.5 5.5-5.5'],
  'arrow-up-right': ['M7 17L17 7', 'M8.5 7H17v8.5'],
  menu: ['M4 7.5h16', 'M4 12h16', 'M4 16.5h10'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  'chevron-down': ['M6.5 9.5l5.5 5.5 5.5-5.5'],
  close: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'],
  alert: ['M12 4.5l8.5 15h-17z', 'M12 10.5v4', 'M12 17.2v.3'],
  mail: ['M4 6.5h16v11H4z', 'M4.5 7l7.5 6 7.5-6'],
  phone: [
    'M8.2 4.5H5.6a1.1 1.1 0 0 0-1.1 1.2C5 13.1 10.9 19 18.3 19.5a1.1 1.1 0 0 0 1.2-1.1v-2.6l-3.6-1.4-1.9 1.9a10.6 10.6 0 0 1-4.3-4.3l1.9-1.9z',
  ],
  message: ['M4.5 5.5h15v10h-9l-4.5 3.5v-3.5h-1.5z'],
  bubble: ['M12 4.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 1 0 0-15z', 'M8.6 10.2a3.6 3.6 0 0 1 2.4-2.6'],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;
