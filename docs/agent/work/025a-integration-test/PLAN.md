# PLAN - 025a-integration-test

## Status
State: EVALUATING

## Issue
#35

## Objetivo
Camada de teste de integracao REAL: Angular x backend containerizado (compose), sem mocks.
Distinta do contract test (OpenAPI estatico) e do e2e (rede mockada). Depende da 025.

## Abordagem
- Harness `scripts/run-integration.sh`: up --build -> wait health/web -> testes -> down -v (trap).
- `playwright.integration.config.js` (baseURL :8080, sem webServer).
- `tests/integration/realstack.spec.js`: API direta (HTTP via `request`) + app real (page, sem mock).

## Operational path & risk
- risk_category: B  # adiciona teste/harness; nao altera runtime de producao; validado localmente.
- human_review: optional

## Escopo
- Incluido: harness, config, spec, npm script, README, validacao real local.
- Fora de escopo: metricas/observabilidade (026/027), script Python up/down (028),
  job de integracao no CI (decisao #6 pendente).

## Gates
- `npm run test:integration`: 5 passed contra a stack real; down -v via trap (ver PROGRESS).
- regressao e2e mockado: 39 passed. encoding: limpo. CI (jobs existentes): inalterado.

## Notas
- Backend skeleton -> 401 em `/api/*`; asserts crescem com o backend.
