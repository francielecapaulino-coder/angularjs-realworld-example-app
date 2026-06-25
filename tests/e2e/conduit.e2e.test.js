'use strict';

/**
 * E2E tests — Conduit Angular 21 app (app-ng) — Fase 4 (corte/validação E2E)
 *
 * Targets the migrated Angular 21 SPA served from app-ng/dist/app-ng/browser
 * (clean URLs, history API). All HTTP calls to conduit.productionready.io are
 * intercepted via page.route() and return controlled mock responses.
 * No real credentials, no real API calls.
 *
 * Fictitious data used throughout:
 *   - token: "fake-jwt-token-e2e-test-only"
 *   - user:  test-e2e@example.test / e2e-user / e2epassword-not-real
 *
 * App routing: clean URLs (e.g. /login, /article/:slug), served on port 4100.
 */

// @ts-check
const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Mock fixtures
// ---------------------------------------------------------------------------

const FAKE_TOKEN = 'fake-jwt-token-e2e-test-only';

const MOCK_USER = {
  email: 'test-e2e@example.test',
  username: 'e2e-user',
  bio: 'E2E test account — fictitious',
  image: 'https://api.realworld.io/images/demo-avatar.png',
  token: FAKE_TOKEN,
};

const MOCK_ARTICLES = [
  {
    slug: 'e2e-test-article-001',
    title: 'E2E Test Article',
    description: 'An article created for E2E testing purposes.',
    body: 'This is the full body of the E2E test article.',
    tagList: ['e2e', 'testing'],
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    favorited: false,
    favoritesCount: 3,
    author: {
      username: 'demo-author',
      bio: null,
      image: 'https://api.realworld.io/images/demo-avatar.png',
      following: false,
    },
  },
];

const MOCK_TAGS = ['e2e', 'testing', 'playwright', 'angular'];

const MOCK_PROFILE = {
  username: 'demo-author',
  bio: 'Demo author for E2E tests',
  image: 'https://api.realworld.io/images/demo-avatar.png',
  following: false,
};

const MOCK_COMMENTS = [
  {
    id: 1,
    createdAt: '2026-06-24T00:00:00.000Z',
    updatedAt: '2026-06-24T00:00:00.000Z',
    body: 'An E2E test comment.',
    author: {
      username: 'demo-author',
      bio: null,
      image: 'https://api.realworld.io/images/demo-avatar.png',
      following: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Helper: intercept all calls to the RealWorld API
// ---------------------------------------------------------------------------

/**
 * Sets up route intercepts for all API endpoints used by the app.
 * Must be called before navigating to any page.
 *
 * @param {import('@playwright/test').Page} page
 */
async function setupApiMocks(page) {
  const API_PATTERN = '**/conduit.productionready.io/api/**';

  await page.route(API_PATTERN, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // GET /tags
    if (method === 'GET' && url.includes('/tags')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tags: MOCK_TAGS }) });
    }

    // GET /articles/feed
    if (method === 'GET' && url.includes('/articles/feed')) {
      const authHeader = route.request().headers()['authorization'] || '';
      if (!authHeader.startsWith('Token ')) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ errors: { message: 'Unauthorized' } }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_ARTICLES, articlesCount: MOCK_ARTICLES.length }) });
    }

    // POST /articles/{slug}/comments  (add comment)
    if (method === 'POST' && url.match(/\/articles\/[^/]+\/comments$/)) {
      const newComment = Object.assign({}, MOCK_COMMENTS[0], { id: 2, body: 'A new E2E comment.', author: MOCK_USER });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ comment: newComment }) });
    }

    // DELETE /articles/{slug}/comments/{id}
    if (method === 'DELETE' && url.match(/\/articles\/[^/]+\/comments\/[^/]+$/)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    }

    // GET /articles/{slug}/comments
    if (method === 'GET' && url.match(/\/articles\/[^/]+\/comments$/)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ comments: MOCK_COMMENTS }) });
    }

    // POST/DELETE /articles/{slug}/favorite
    if (url.match(/\/articles\/[^/]+\/favorite$/)) {
      const favorited = Object.assign({}, MOCK_ARTICLES[0], {
        favorited: method === 'POST',
        favoritesCount: method === 'POST' ? 4 : 3,
      });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ article: favorited }) });
    }

    // PUT /articles/{slug}  (update) — must precede the generic GET match
    if (method === 'PUT' && url.match(/\/articles\/[^/]+$/)) {
      const updated = Object.assign({}, MOCK_ARTICLES[0], { title: 'Updated E2E Article' });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ article: updated }) });
    }

    // DELETE /articles/{slug}
    if (method === 'DELETE' && url.match(/\/articles\/[^/]+$/)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    }

    // GET /articles/{slug}  (specific article — AFTER feed/comments/favorite)
    if (method === 'GET' && url.match(/\/articles\/[^/]+$/) && !url.includes('/feed')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ article: MOCK_ARTICLES[0] }) });
    }

    // POST /articles  (create)
    if (method === 'POST' && url.endsWith('/articles')) {
      const newArticle = Object.assign({}, MOCK_ARTICLES[0], {
        slug: 'new-e2e-article-001',
        title: 'New E2E Article',
        description: 'Created during E2E test',
      });
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ article: newArticle }) });
    }

    // GET /articles  (list)
    if (method === 'GET' && url.includes('/articles')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_ARTICLES, articlesCount: MOCK_ARTICLES.length }) });
    }

    // GET /user  (current user)
    if (method === 'GET' && url.endsWith('/user')) {
      const authHeader = route.request().headers()['authorization'] || '';
      if (!authHeader.startsWith('Token ')) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ errors: { message: 'Unauthorized' } }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: MOCK_USER }) });
    }

    // PUT /user  (update account)
    if (method === 'PUT' && url.endsWith('/user')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: MOCK_USER }) });
    }

    // POST /users/login
    if (method === 'POST' && url.endsWith('/users/login')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: MOCK_USER }) });
    }

    // POST /users  (register)
    if (method === 'POST' && url.endsWith('/users')) {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ user: MOCK_USER }) });
    }

    // POST/DELETE /profiles/{username}/follow
    if (url.match(/\/profiles\/[^/]+\/follow$/)) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile: Object.assign({}, MOCK_PROFILE, { following: method === 'POST' }) }) });
    }

    // GET /profiles/{username}
    if (method === 'GET' && url.includes('/profiles/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ profile: MOCK_PROFILE }) });
    }

    // Fallback
    return route.fulfill({ status: 404, body: '' });
  });
}

/**
 * Sets the fictitious JWT token in localStorage BEFORE any page script runs,
 * so the Angular app boots already authenticated (verifyAuth populates the user).
 *
 * @param {import('@playwright/test').Page} page
 */
async function injectFakeTokenBeforeLoad(page) {
  await page.addInitScript((token) => {
    try {
      localStorage.setItem('jwtToken', token);
    } catch (_) { /* localStorage unavailable before first load — ignored */ }
  }, FAKE_TOKEN);
}

// ---------------------------------------------------------------------------
// Suite 1 — Home page (unauthenticated)
// ---------------------------------------------------------------------------

test.describe('Home page — unauthenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('loads home page and shows the banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-page')).toBeVisible();
  });

  test('displays article previews from global feed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.article-preview').first()).toBeVisible();
    await expect(page.locator('.preview-link').first()).toBeVisible();
  });

  test('displays article title in preview', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.article-preview h1').first()).toContainText('E2E Test Article');
  });

  test('shows Sign In and Sign Up links when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Login flow
// ---------------------------------------------------------------------------

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('login page renders form with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('button.btn-primary')).toBeVisible();
  });

  test('submit login form stores token and navigates to home', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', 'test-e2e@example.test');
    await page.fill('input[placeholder="Password"]', 'e2epassword-not-real');
    await page.click('button.btn-primary');
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
    const storedToken = await page.evaluate(() => localStorage.getItem('jwtToken'));
    expect(storedToken).toBe(FAKE_TOKEN);
  });

  test('username appears in nav after login (reactive signals, no reload needed)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', 'test-e2e@example.test');
    await page.fill('input[placeholder="Password"]', 'e2epassword-not-real');
    await page.click('button.btn-primary');
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
    // The Angular header reacts to the currentUser signal — no reload required
    // (this fixes the legacy header's broken $scope.$watch).
    await expect(page.locator('nav.navbar')).toContainText('e2e-user', { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Register flow
// ---------------------------------------------------------------------------

test.describe('Register flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('register page renders form with username, email and password fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[placeholder="Username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
  });

  test('submit register form navigates to home', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="Username"]', 'e2e-user');
    await page.fill('input[placeholder="Email"]', 'test-e2e@example.test');
    await page.fill('input[placeholder="Password"]', 'e2epassword-not-real');
    await page.click('button.btn-primary');
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Article detail
// ---------------------------------------------------------------------------

test.describe('Article detail', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('clicking an article preview navigates to article page', async ({ page }) => {
    await page.goto('/');
    await page.locator('.preview-link').first().click();
    await expect(page.locator('.article-page')).toBeVisible({ timeout: 10000 });
  });

  test('article page shows title and author', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('.article-page')).toBeVisible();
    await expect(page.locator('.article-page')).toContainText('E2E Test Article');
    await expect(page.locator('.article-page')).toContainText('demo-author');
  });

  test('article body markdown is rendered (sanitized) into the content area', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('.article-content')).toContainText('full body of the E2E test article');
  });
});

// ---------------------------------------------------------------------------
// Suite 5 — Create article (authenticated) + editor guard
// ---------------------------------------------------------------------------

test.describe('Create article — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('editor page renders article form fields', async ({ page }) => {
    await page.goto('/editor');
    await expect(page.locator('input[placeholder="Article Title"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('filling and submitting the editor form navigates to the article page', async ({ page }) => {
    await page.goto('/editor');
    await page.fill('input[placeholder="Article Title"]', 'New E2E Article');
    await page.fill('input[placeholder="What\'s this article about?"]', 'E2E description');
    await page.fill('textarea[placeholder="Write your article (in markdown)"]', 'Article body content.');
    await page.click('button[type="submit"]');
    await expect(page.locator('.article-page')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Editor guard — anonymous', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('anonymous visit to /editor is redirected to /login', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
  });

  test('anonymous visit to /settings is redirected to /login', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 6 — Favorite article (authenticated)
// ---------------------------------------------------------------------------

test.describe('Favorite article — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('favorite button is visible on article preview', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-favorite-button button').first()).toBeVisible();
  });

  test('clicking favorite on preview toggles to btn-primary (favorited)', async ({ page }) => {
    await page.goto('/');
    const favoriteBtn = page.locator('app-favorite-button button').first();
    await expect(favoriteBtn).toBeVisible();
    await expect(favoriteBtn).toHaveClass(/btn-outline-primary/);
    await favoriteBtn.click();
    await expect(favoriteBtn).toHaveClass(/btn-primary/, { timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 7 — Article actions (authenticated) — BUG-FREE (baseline inverted)
//
// The legacy article-actions crashed when authenticated (constructor read the
// binding before $onInit). The Angular 21 migration fixed this (slice 010):
// follow/favorite render for a non-author. This suite REPLACES the old
// "Legacy baseline — bug" suite and asserts the corrected behavior.
// ---------------------------------------------------------------------------

test.describe('Article actions — authenticated (bug fixed)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('authenticated non-author sees Follow + Favorite on the article page', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('.article-page')).toBeVisible({ timeout: 10000 });
    // Previously asserted count 0 (legacy crash). Now they MUST render.
    await expect(page.locator('.article-page app-follow-button button').first()).toBeVisible();
    await expect(page.locator('.article-page app-favorite-button button').first()).toBeVisible();
  });

  test('authenticated user can post a comment', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('form.comment-form')).toBeVisible({ timeout: 10000 });
    await page.fill('form.comment-form textarea', 'A new E2E comment.');
    await page.click('form.comment-form button[type="submit"]');
    await expect(page.locator('.card-text').filter({ hasText: 'A new E2E comment.' })).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 8 — Follow user (anonymous CTA)
// ---------------------------------------------------------------------------

test.describe('Follow user — anonymous', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('follow button is visible on article page for an anonymous visitor', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('app-follow-button button').first()).toBeVisible();
  });

  test('favorite button is also visible on the article page for an anonymous visitor', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('app-favorite-button button').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 9 — Profile page (tabs)
// ---------------------------------------------------------------------------

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('profile page shows the username and article tabs', async ({ page }) => {
    await page.goto('/profile/demo-author');
    await expect(page.locator('.profile-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.profile-page')).toContainText('demo-author');
    await expect(page.locator('.articles-toggle')).toContainText('My Articles');
    await expect(page.locator('.articles-toggle')).toContainText('Favorited Articles');
  });

  test('switching to the Favorited tab keeps the list visible', async ({ page }) => {
    await page.goto('/profile/demo-author');
    await expect(page.locator('.profile-page')).toBeVisible({ timeout: 10000 });
    await page.locator('.articles-toggle .nav-link', { hasText: 'Favorited Articles' }).click();
    await expect(page.locator('.article-preview').first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 10 — Settings (authenticated) + logout
// ---------------------------------------------------------------------------

test.describe('Settings — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('settings page prefills the form with the current user', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder="Username"]')).toHaveValue('e2e-user');
    await expect(page.locator('input[placeholder="Email"]')).toHaveValue('test-e2e@example.test');
  });

  test('logout clears the token and returns to home', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 10000 });
    await page.locator('button.btn-outline-danger').click();
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
    const storedToken = await page.evaluate(() => localStorage.getItem('jwtToken'));
    expect(storedToken).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 12 — verifyAuth failure during bootstrap
//
// If session restore (GET /user) fails (e.g. expired token or a network error),
// the app must end up logged out and route guards must redirect cleanly to /login
// for protected routes — never hang on the loading spinner.
// ---------------------------------------------------------------------------

test.describe('verifyAuth failure on bootstrap', () => {
  test('network error on GET /user during a guarded-route visit redirects to /login', async ({ page }) => {
    await page.route('**/conduit.productionready.io/api/**', async (route) => {
      const url = route.request().url();
      if (route.request().method() === 'GET' && url.endsWith('/user')) {
        return route.abort('failed'); // simulated network failure during session restore
      }
      if (url.includes('/tags')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tags: MOCK_TAGS }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_ARTICLES, articlesCount: MOCK_ARTICLES.length }) });
    });

    // Boot with a (now invalid) token, navigating straight to a guarded route.
    await injectFakeTokenBeforeLoad(page);
    await page.goto('/settings');

    // verifyAuth fails -> session purged -> guard redirects to /login (no hang).
    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 });
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    const storedToken = await page.evaluate(() => localStorage.getItem('jwtToken'));
    expect(storedToken).toBeNull(); // token cleared on failed restore
  });
});

// ---------------------------------------------------------------------------
// Suite 13 — Login validation errors (negative auth)
// ---------------------------------------------------------------------------

test.describe('Login validation errors', () => {
  test('invalid credentials (422) show the API error messages', async ({ page }) => {
    await page.route('**/conduit.productionready.io/api/**', async (route) => {
      const url = route.request().url();
      if (route.request().method() === 'POST' && url.endsWith('/users/login')) {
        return route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ errors: { 'email or password': ['is invalid'] } }),
        });
      }
      if (url.includes('/tags')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tags: MOCK_TAGS }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: [], articlesCount: 0 }) });
    });

    await page.goto('/login');
    await page.fill('input[placeholder="Email"]', 'test-e2e@example.test');
    await page.fill('input[placeholder="Password"]', 'wrong-not-real');
    await page.click('button.btn-primary');

    await expect(page.locator('.error-messages li')).toContainText('is invalid', { timeout: 10000 });
    // Still on the login page (no navigation on failure).
    await expect(page).toHaveURL(/\/login$/);
  });
});

// ---------------------------------------------------------------------------
// Suite 14 — Authenticated home feed tabs (Your Feed / Global Feed)
// ---------------------------------------------------------------------------

test.describe('Home feed tabs — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('authenticated home shows Your Feed and Global Feed tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.feed-toggle')).toContainText('Your Feed');
    await expect(page.locator('.feed-toggle')).toContainText('Global Feed');
    // Switching to Global Feed keeps article previews visible.
    await page.locator('.feed-toggle .nav-link', { hasText: 'Global Feed' }).click();
    await expect(page.locator('.article-preview').first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Suite 15 — Settings update (PUT /user) navigates to the profile
// ---------------------------------------------------------------------------

test.describe('Settings update — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectFakeTokenBeforeLoad(page);
  });

  test('updating settings PUTs /user and navigates to the profile page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('.settings-page')).toBeVisible({ timeout: 10000 });
    await page.fill('textarea[placeholder="Short bio about you"]', 'Updated bio via E2E');
    await page.click('button.btn-primary');
    // setupApiMocks returns MOCK_USER (username e2e-user) for PUT /user.
    await expect(page).toHaveURL(/\/profile\/e2e-user$/, { timeout: 10000 });
    await expect(page.locator('.profile-page')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 16 — Author actions on the article page (Edit / Delete)
//
// When the logged-in user IS the article author, article-actions shows
// Edit/Delete instead of Follow/Favorite. Deleting routes back home.
// ---------------------------------------------------------------------------

test.describe('Article author actions — authenticated', () => {
  test.beforeEach(async ({ page }) => {
    // GET /user returns a user matching the article author (demo-author),
    // so the author branch of article-actions renders.
    await page.route('**/conduit.productionready.io/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      if (method === 'GET' && url.endsWith('/user')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: { ...MOCK_USER, username: 'demo-author' } }) });
      }
      if (method === 'DELETE' && url.match(/\/articles\/[^/]+$/)) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      }
      if (method === 'GET' && url.match(/\/articles\/[^/]+\/comments$/)) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ comments: MOCK_COMMENTS }) });
      }
      if (method === 'GET' && url.match(/\/articles\/[^/]+$/) && !url.includes('/feed')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ article: MOCK_ARTICLES[0] }) });
      }
      if (url.includes('/tags')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tags: MOCK_TAGS }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_ARTICLES, articlesCount: MOCK_ARTICLES.length }) });
    });
    await injectFakeTokenBeforeLoad(page);
  });

  test('author sees Edit and Delete on the article page', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('.article-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.article-page')).toContainText('Edit Article');
    await expect(page.locator('.article-page')).toContainText('Delete Article');
    // The non-author Follow button must NOT be present.
    await expect(page.locator('.article-page app-follow-button')).toHaveCount(0);
  });

  test('deleting the article routes back to the home page', async ({ page }) => {
    await page.goto('/article/e2e-test-article-001');
    await expect(page.locator('.article-page')).toBeVisible({ timeout: 10000 });
    await page.locator('button.btn-outline-danger', { hasText: 'Delete Article' }).first().click();
    await expect(page.locator('.home-page')).toBeVisible({ timeout: 10000 });
  });
});
