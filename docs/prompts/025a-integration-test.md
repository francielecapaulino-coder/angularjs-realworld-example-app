# Slice 025a - Integration test real (frontend x backend containerizado)

- **Issue:** #35
- **Data:** 2026-06-26
- **Categoria de risco:** B (teste/harness; validado localmente com Docker)

## Prompt(s) do usuario

> "criar issue+branch da 025a; harness que sobe o compose, aguarda health e roda checks reais
>  (HTTP direto a api + Playwright sem mock), distinto do contract test"

## Decisoes tomadas

- Harness em bash (`scripts/run-integration.sh`) com `trap EXIT` -> `down -v` sempre.
- Config Playwright separada (`tests/integration`, baseURL :8080, sem webServer) para nao
  colidir com o e2e mockado (`tests/e2e`).
- Spec cobre 2 camadas: API direta (HTTP via `request`) + app real (page, sem mock).
- CI de integracao nao adicionado (decisao #6); harness pronto para virar job dedicado.

## Skills necessarias

- Nenhuma skill especializada (`run_skill`) necessaria.

## Resultado

- `npm run test:integration`: 5 passed contra a stack real; down -v via trap. e2e 39 ainda verde.
  PR: (a abrir).
