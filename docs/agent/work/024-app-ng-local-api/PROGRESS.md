# PROGRESS - 024-app-ng-local-api

State: EVALUATING

## Issue
#31

## Itens entregues
- `apiBase` relativo `/api` (`app.constants.ts`).
- `proxy.conf.json` (dev: `/api` -> http://localhost:8080) + `angular.json` (serve.proxyConfig).
- E2E: 7 globs migrados para `**/api/**` (constante `API_PATTERN` + inline) + cabecalho.
- README atualizado.

## Gates (evidencia)
| Gate | Resultado |
|---|---|
| build (app-ng) | OK |
| unit (Vitest) | **103 passed** |
| e2e (Playwright) | **39 passed** |
| encoding_check | 0 U+FFFD |

## Notas
- E2E continua mockado; integracao real contra backend containerizado fica na slice 025a.
- Corrigido tambem um caractere corrompido preexistente em `app.constants.ts` (comentario jwtKey).
