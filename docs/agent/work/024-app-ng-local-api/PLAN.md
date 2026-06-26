# PLAN - 024-app-ng-local-api

## Status
State: EVALUATING

## Issue
#31

## Objetivo
Tornar o app-ng configuravel para falar com a API local (em vez da API publica RealWorld),
via caminho relativo `/api` + proxy no dev. (Slice 024 do plano macro full-scope.)

## Implementado
- `app.constants.ts`: `apiBase` agora **relativo** (`/api`).
- `app-ng/proxy.conf.json`: dev proxy `/api` -> `http://localhost:8080` (backend).
- `angular.json`: `serve.options.proxyConfig = "proxy.conf.json"`.
- E2E: globs de mock migrados de `**/conduit.productionready.io/api/**` para `**/api/**`.
- README: nota de API local/dev proxy.

## Escopo
- Incluido: apiBase relativo + proxy.conf + angular.json + ajuste de mocks e2e + README.
- Fora de escopo: nginx/Dockerfile (025); integration test real sem mocks (025a).

## Operational path & risk
- risk_category: B  # config de frontend; reversivel; sem backend real nos testes (e2e mockado).
- human_review: optional

## Gates
- build (app-ng): OK.
- unit (Vitest): 103 passed (specs usam APP_CONSTANTS.apiBase -> acompanham `/api`).
- e2e (Playwright): 39 passed (globs `/api`).
- encoding_check: sem U+FFFD nos arquivos da slice.

## Notas
- O E2E permanece **mockado** (`page.route('**/api/**')`); nao depende de backend real.
  O teste de integracao real contra o backend containerizado e a slice **025a**.
- Incidente: o comentario JSDoc com `**/api/**` continha `*/` e fechou o bloco -> ajustado.
