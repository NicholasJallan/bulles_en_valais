/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

const MIN_COVERAGE = { lines: 80, functions: 80, branches: 80, statements: 80 };

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/data/**/*.ts', 'src/i18n/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
      reporter: ['text', 'html'],
      // One threshold per folder: the dictionaries (plain data, always covered) must not
      // hide untested logic in src/lib.
      thresholds: {
        'src/lib/**': MIN_COVERAGE,
        'src/data/**': MIN_COVERAGE,
        'src/i18n/**': MIN_COVERAGE,
      },
    },
  },
});
