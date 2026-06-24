# ![Angular 21 Conduit Example App](project-logo.png)

> Example **Angular 21** (standalone components + Signals) codebase that adheres to the
> [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This repository was migrated from the original AngularJS 1.5 app to **Angular 21**.
The official application now lives in **[`app-ng/`](app-ng/)**. The original AngularJS
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

### Making requests to the backend API

For convenience, there is a live API server at https://conduit.productionready.io/api
for the application to make requests against. You can view
[the API spec](https://github.com/GoThinkster/productionready/blob/master/api), which
contains all routes & responses for the server. The source code for the backend server
(Node, Rails, Django) is in the [main RealWorld repo](https://github.com/gothinkster/realworld).

To point the app at a different API, edit `app-ng/src/app/core/config/app.constants.ts`
and change `apiBase` (e.g. `http://localhost:3000/api`).

<br />

[![Brought to you by Thinkster](https://raw.githubusercontent.com/gothinkster/realworld/master/media/end.png)](https://thinkster.io)
