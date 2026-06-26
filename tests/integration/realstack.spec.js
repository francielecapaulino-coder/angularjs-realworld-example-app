// @ts-check

/**
 * REAL integration tests (slice 025a) - run against the live containerized stack
 * (docker-compose: web/nginx + api/Spring Boot + db/Postgres), with NO network mocks.
 *
 * How this differs from the other test layers:
 *   - tests/contract  : static checks vs the OpenAPI spec + a public live API.
 *                       Does NOT exercise THIS repo's backend.
 *   - tests/e2e       : mocks the network (page.route) and serves a local SPA build.
 *                       Never hits a real backend.
 *   - tests/integration (this): hits the REAL backend served by the compose stack,
 *                       both directly (HTTP) and through the app (nginx-served SPA).
 *
 * Prerequisite: the stack must be up. Use `npm run test:integration`, which calls
 * scripts/run-integration.sh to bring the stack up (and tear it down) around this run.
 *
 * Note on scope: the backend is currently a skeleton (Spring Security on, no domain
 * endpoints), so `/api/*` answers 401. These tests assert the wiring is real and
 * end-to-end (app reaches a real backend through nginx). As the backend grows, add
 * real-data assertions (register/login/create-article) here.
 */

const { test, expect } = require('@playwright/test');

const WEB_BASE = 'http://localhost:8080'; // nginx-served SPA (proxies /api -> api)
const API_BASE = 'http://localhost:8081'; // backend published directly (debug/smoke)

// ---------------------------------------------------------------------------
// Layer 1 - API reachability (direct HTTP, no browser, no mocks)
// ---------------------------------------------------------------------------

test.describe('API - direct HTTP against the real backend', () => {
  test('backend is reachable and answers on /api (Spring Security -> 401)', async ({ request }) => {
    // A real request all the way to the Spring Boot app + datasource. The skeleton
    // protects every route, so 401 proves the app is live (not a proxy/connection error).
    const res = await request.get(`${API_BASE}/api/articles`);
    expect(res.status()).toBe(401);
  });

  test('the SAME call routed through nginx (/api) reaches the backend too', async ({ request }) => {
    // Proves the web -> api reverse proxy works: identical status to the direct call.
    const direct = await request.get(`${API_BASE}/api/articles`);
    const viaProxy = await request.get(`${WEB_BASE}/api/articles`);
    expect(viaProxy.status()).toBe(direct.status());
    expect(viaProxy.status()).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Layer 2 - The real app served by nginx, talking to the real backend (NO mocks)
// ---------------------------------------------------------------------------

test.describe('App - real SPA against the real backend (no mocks)', () => {
  test('home page renders (app shell boots against the live stack)', async ({ page }) => {
    await page.goto('/');
    // The Angular shell must render even though the skeleton backend returns no data.
    await expect(page.locator('.home-page')).toBeVisible();
    await expect(page.locator('nav.navbar')).toBeVisible();
  });

  test('anonymous nav shows Sign in / Sign up', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('client-side routing works (navigate to /login, served via SPA fallback)', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
  });
});
