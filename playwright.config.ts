import { defineConfig, devices } from '@playwright/test';

// PW_PORT lets two worktrees run their E2E suites side by side.
const PORT = Number(process.env.PW_PORT ?? 4321);
// scripts/serve-with-csp.mjs: dist/ under the production security headers (`csp` project).
const CSP_PORT = PORT + 10;
const CSP_TESTS = 'csp/**';
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      // --ignore-lock keeps `astro preview` in the foreground: under a coding agent, Astro 7
      // would otherwise detach it and Playwright could neither await nor stop it.
      command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
      url: `http://localhost:${PORT}/`,
      // Never test a server started earlier: it would serve a stale build.
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // Reads dist/ on each request, so it serves the build of the server above; the tests only
      // start once both answer.
      command: `node scripts/serve-with-csp.mjs --port ${CSP_PORT}`,
      url: `http://127.0.0.1:${CSP_PORT}/`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  // No firefox project: the Firefox build of Playwright 1.63 does not start on macOS 27.0.1, and
  // Firefox is validated only when it works (D21). Add it back once a Playwright update fixes it:
  // { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: DESKTOP_VIEWPORT } },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: DESKTOP_VIEWPORT },
      testIgnore: CSP_TESTS,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: DESKTOP_VIEWPORT },
      testIgnore: CSP_TESTS,
    },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, testIgnore: CSP_TESTS },
    {
      // The whole visit under the final CSP: npx playwright test --project=csp
      name: 'csp',
      testMatch: CSP_TESTS,
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${CSP_PORT}` },
    },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] }, testIgnore: CSP_TESTS },
  ],
});
