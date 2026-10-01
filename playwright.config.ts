import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
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
  webServer: {
    // --ignore-lock keeps `astro preview` in the foreground: under a coding agent, Astro 7
    // would otherwise detach it and Playwright could neither await nor stop it.
    command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    // Never test a server started earlier: it would serve a stale build.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  // No firefox project: the Firefox build of Playwright 1.63 does not start on macOS 27.0.1, and
  // Firefox is validated only when it works (D21). Add it back once a Playwright update fixes it:
  // { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: DESKTOP_VIEWPORT } },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: DESKTOP_VIEWPORT } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: DESKTOP_VIEWPORT } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] } },
  ],
});
