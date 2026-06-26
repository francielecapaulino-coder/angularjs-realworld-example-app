# ![Angular 21 Conduit Example App](project-logo.png)

> Example **Angular 21** (standalone components + Signals) codebase that adheres to the
> [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This repository was migrated from the original AngularJS 1.5 app to **Angular 21**.
The official application now lives in **[`app-ng/`](app-ng/)**. The RealWorld **backend API**
(Spring Boot 4 / Java 25 / Gradle) was integrated via `git subtree` under **[`api/`](api/)**.
The original AngularJS
app is archived under **[`legacy/`](legacy/README.md)** for historical reference and is
no longer built, served, or tested.

# Getting started

Requires Node **>= 20.19 / 22.12** (Angular 21).

```bash
# 1. Install the Angular app dependencies
cd app-ng && npm install

# 2. Run it in dev mode
npm start            # ng serve (http://localhost:4200)

# 3. Production build (outputs app-ng/dist/app-ng/browser)
npm run build
```

From the repository root you can also:

```bash
npm run build        # builds the Angular app (delegates to app-ng)
npm run serve        # serves the built SPA on http://localhost:4100
```

# Testing

```bash
# Unit tests (Vitest, inside app-ng)
npm run test:unit

# Contract tests (validate the RealWorld API / OpenAPI spec)
npm run test:contract

# End-to-end tests (Playwright; builds the app then serves it on :4100)
npm run test:e2e
```

# Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull
request to `master`, with two jobs:

- **validate** (Node 22): builds the Angular app and runs the safety nets - build
  (`app-ng`), unit tests (Vitest), contract tests (OpenAPI), and end-to-end tests
  (Playwright; serves the built SPA on port 4100).
- **backend** (JDK 25): builds and tests the Spring Boot API (`api/`) via
  `./gradlew build`, with a Postgres service for the JPA context.

On failure, the Playwright HTML report is uploaded as a build artifact. There is no
deploy step yet - a hosting target (GitHub Pages / Netlify / Vercel) will be added in
a follow-up.

### Making requests to the backend API

For convenience, there is a live API server at https://conduit.productionready.io/api
for the application to make requests against. You can view
[the API spec](https://github.com/GoThinkster/productionready/blob/master/api), which
contains all routes & responses for the server. The source code for the backend server
(Node, Rails, Django) is in the [main RealWorld repo](https://github.com/gothinkster/realworld).

The app calls the API via the relative path **`/api`** (see `app-ng/src/app/core/config/app.constants.ts`).
In dev, `ng serve` proxies `/api` to the local backend (`app-ng/proxy.conf.json` -> http://localhost:8080).
In prod/docker, nginx serves the SPA and proxies `/api` to the backend (see below).
To target a different API, change `apiBase` or the proxy target.

### Running the full stack with Docker

The whole stack (Angular SPA + Spring Boot API + Postgres) is containerized and
orchestrated with `docker-compose.yml`:

```bash
docker compose up --build      # build images and start db + api + web
# open http://localhost:8080    # the app (nginx serves the SPA, proxies /api -> api)
docker compose down            # stop and remove containers (add -v to drop the db volume)
```

- **web** (nginx, host `:8080`): serves the prebuilt Angular bundle and reverse-proxies
  `/api` to the backend over the internal network (`app-ng/Dockerfile`, `app-ng/nginx.conf`).
- **api** (Spring Boot, host `:8081`): built from `api/Dockerfile` (Gradle/JDK 25 ->
  JRE slim); reads its datasource from `SPRING_DATASOURCE_*` env vars.
- **db** (Postgres 16): internal-only, seeded via `POSTGRES_*` (example credentials only).

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)
