'use strict';

// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for the REAL integration tests (slice 025a).
 *
 * Unlike the mocked E2E suite (playwright.config.js -> tests/e2e, which intercepts
 * the network with page.route and serves a local SPA build), this config runs
 * against the FULL containerized stack started by docker-compose:
 *   web (nginx, :8080) -> proxies /api -> api (Spring Boot, :8080) -> db (Postgres).
 *
 * There is NO webServer here: scripts/run-integration.sh brings the stack up
 * (and tears it down) around the test run. Tests do NOT mock the network.
 */
module.exports = defineConfig({
  testDir: './tests/integration',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    // The app is served by nginx (compose `web` service) on host port 8080.
    baseURL: 'http://localhost:8080',
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
});
