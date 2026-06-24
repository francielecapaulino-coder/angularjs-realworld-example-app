'use strict';

// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for Conduit E2E tests — targets the Angular 21 app (app-ng).
 *
 * Prerequisites before running:
 *   1. Build the Angular app:  cd app-ng && npm run build
 *   2. Run:                    npm run test:e2e
 *
 * The webServer serves the app-ng build as a SPA (history-API fallback via `serve -s`)
 * on port 4100. All API calls to conduit.productionready.io are intercepted via
 * page.route() inside the tests — no real backend required.
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
    // Serve the Angular SPA build with history-API fallback (-s).
    command: 'node_modules/.bin/serve -s app-ng/dist/app-ng/browser -l 4100 --no-clipboard',
    url: 'http://localhost:4100',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
