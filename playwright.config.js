'use strict';

// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for Conduit AngularJS E2E tests.
 *
 * Prerequisites before running:
 *   1. Build the app: node_modules/.bin/gulp html browserify
 *   2. Run: npm run test:e2e
 *
 * All API calls to conduit.productionready.io are intercepted via page.route()
 * inside the tests — no real backend required.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 20000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:4100',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'node_modules/.bin/serve -s build -l 4100 --no-clipboard',
    url: 'http://localhost:4100',
    reuseExistingServer: false,
    timeout: 10000,
  },
});
