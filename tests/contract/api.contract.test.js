'use strict';

/**
 * Contract tests — RealWorld Conduit API
 *
 * Validates that the live API and the OpenAPI spec (docs/api/realworld-openapi.yaml)
 * agree on paths, envelopes, auth scheme and status codes.
 *
 * Live endpoint: node-express-conduit.appspot.com
 *   (used because conduit.productionready.io returned HTTP 530 on 2026-06-24;
 *    both implement the same RealWorld API contract)
 *
 * No real credentials are used. Auth-protected endpoints are tested only for
 * the absence of a valid token (expect 401). Examples use fictitious data only.
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');
const yaml  = require('js-yaml');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OPENAPI_PATH = path.resolve(__dirname, '../../docs/api/realworld-openapi.yaml');
const LIVE_BASE    = 'https://node-express-conduit.appspot.com/api';

/** Load and parse the OpenAPI spec once for all static tests. */
function loadSpec() {
  return yaml.safeLoad(fs.readFileSync(OPENAPI_PATH, 'utf8'));
}

/**
 * HTTP GET that follows a single redirect (307/301/302/308) and returns
 * { status, body } as a Promise. Works on Node >= 10.
 */
function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const options = Object.assign(require('url').parse(url), {
      headers: headers || {},
    });
    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        resolve({ status: res.statusCode, body: parsed });
      });
    }).on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Suite 1 — Static: OpenAPI spec structure
// ---------------------------------------------------------------------------

describe('Contract — Static: OpenAPI spec structure', () => {
  let spec;

  beforeAll(() => {
    spec = loadSpec();
  });

  test('spec file exists and is valid YAML/OpenAPI 3', () => {
    expect(spec).toBeDefined();
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.paths).toBeDefined();
    expect(spec.components).toBeDefined();
  });

  test('all required paths and methods are present in the spec', () => {
    const required = [
      ['post',   '/users/login'],
      ['post',   '/users'],
      ['get',    '/user'],
      ['put',    '/user'],
      ['get',    '/profiles/{username}'],
      ['post',   '/profiles/{username}/follow'],
      ['delete', '/profiles/{username}/follow'],
      ['get',    '/articles'],
      ['get',    '/articles/feed'],
      ['get',    '/articles/{slug}'],
      ['post',   '/articles'],
      ['put',    '/articles/{slug}'],
      ['delete', '/articles/{slug}'],
      ['post',   '/articles/{slug}/favorite'],
      ['delete', '/articles/{slug}/favorite'],
      ['get',    '/articles/{slug}/comments'],
      ['post',   '/articles/{slug}/comments'],
      ['delete', '/articles/{slug}/comments/{id}'],
      ['get',    '/tags'],
    ];

    const missing = [];
    required.forEach(([method, pathKey]) => {
      if (!spec.paths[pathKey] || !spec.paths[pathKey][method]) {
        missing.push(method.toUpperCase() + ' ' + pathKey);
      }
    });

    expect(missing).toEqual([]);
  });

  test('security scheme uses "Token" (not "Bearer")', () => {
    const raw = fs.readFileSync(OPENAPI_PATH, 'utf8');
    // Must not contain "Bearer" as a scheme keyword in any value
    expect(raw).not.toMatch(/\bBearer\b/);
    // Must define TokenAuth
    expect(spec.components.securitySchemes).toBeDefined();
    expect(spec.components.securitySchemes.TokenAuth).toBeDefined();
    expect(spec.components.securitySchemes.TokenAuth.type).toBe('apiKey');
    expect(spec.components.securitySchemes.TokenAuth.in).toBe('header');
    expect(spec.components.securitySchemes.TokenAuth.name).toBe('Authorization');
  });

  test('main response envelopes are defined as schemas', () => {
    const schemas = spec.components.schemas;
    const required = [
      'UserResponse',
      'SingleArticleResponse',
      'MultipleArticlesResponse',
      'SingleCommentResponse',
      'MultipleCommentsResponse',
      'ProfileResponse',
      'TagsResponse',
    ];
    const missing = required.filter((name) => !schemas[name]);
    expect(missing).toEqual([]);
  });

  test('protected endpoints declare 401 response', () => {
    const protectedPaths = [
      ['/user',          'get'],
      ['/articles/feed', 'get'],
      ['/articles',      'post'],
    ];
    const missing401 = [];
    protectedPaths.forEach(([pathKey, method]) => {
      const op = spec.paths[pathKey] && spec.paths[pathKey][method];
      if (!op || !op.responses || !op.responses['401']) {
        missing401.push(method.toUpperCase() + ' ' + pathKey);
      }
    });
    expect(missing401).toEqual([]);
  });

  test('no real secrets in spec examples (no real JWT pattern)', () => {
    const raw = fs.readFileSync(OPENAPI_PATH, 'utf8');
    // Real AWS keys, GitHub tokens, Stripe keys, or long random JWT payloads
    expect(raw).not.toMatch(/AKIA[0-9A-Z]{16}/);
    expect(raw).not.toMatch(/ghp_[A-Za-z0-9]{36}/);
    expect(raw).not.toMatch(/sk_live_[A-Za-z0-9]/);
    // Any example value for Authorization must not look like a real JWT
    // (three Base64url segments separated by dots, each ≥ 20 chars)
    expect(raw).not.toMatch(/eyJ[A-Za-z0-9_-]{18,}\.[A-Za-z0-9_-]{18,}\.[A-Za-z0-9_-]{18,}/);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Live: network calls to node-express-conduit.appspot.com
// ---------------------------------------------------------------------------

describe('Contract — Live API: node-express-conduit.appspot.com', () => {
  test('GET /tags returns 200 with { tags: Array }', async () => {
    const { status, body } = await httpGet(LIVE_BASE + '/tags');
    expect(status).toBe(200);
    expect(body).toHaveProperty('tags');
    expect(Array.isArray(body.tags)).toBe(true);
  });

  test('GET /articles returns 200 with { articles: Array, articlesCount: Number }', async () => {
    const { status, body } = await httpGet(LIVE_BASE + '/articles');
    expect(status).toBe(200);
    expect(body).toHaveProperty('articles');
    expect(Array.isArray(body.articles)).toBe(true);
    expect(body).toHaveProperty('articlesCount');
    expect(typeof body.articlesCount).toBe('number');
  });

  test('GET /user without token returns 401', async () => {
    const { status } = await httpGet(LIVE_BASE + '/user');
    expect(status).toBe(401);
  });

  test('GET /articles/feed without token returns 401', async () => {
    const { status } = await httpGet(LIVE_BASE + '/articles/feed');
    expect(status).toBe(401);
  });

  test('GET /user with fictitious token returns 401 (not 500)', async () => {
    // Confirms the API rejects invalid tokens gracefully.
    // Token value is explicitly fictitious: "fake-jwt-token-test-only"
    const { status } = await httpGet(LIVE_BASE + '/user', {
      Authorization: 'Token fake-jwt-token-test-only',
    });
    // Must be a 4xx client error, not a server crash
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });
});
