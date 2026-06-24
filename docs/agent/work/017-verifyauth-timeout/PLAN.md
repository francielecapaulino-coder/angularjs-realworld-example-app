# PLAN — 017-verifyauth-timeout

## Status
State: EVALUATING

## Objetivo
Tratar falhas do `verifyAuth` no bootstrap de forma limpa e sem travar o app:
token expirado (401), erro de rede e **requisição travada** devem resultar em
sessão limpa + redirect a `/login` (via guard). Definir um **timeout razoável**
para a requisição de restauração de sessão (GET /user).

## Escopo
- Incluído (app-ng):
  - `auth.service.ts`: adicionar `timeout(VERIFY_AUTH_TIMEOUT_MS)` ao pipe do `verifyAuth`
    (constante exportada = 8000ms). Em timeout, o stream erra → o `catchError` existente
    faz `purgeAuth()` + `of(false)` (mesmo caminho de 401/erro de rede). `verifyAuth`
    nunca rejeita → o initializer sempre conclui.
  - `auth.service.spec.ts`: testes p/ erro de rede e **timeout** (vitest fake timers).
  - E2E: `GET /user` abortado (erro de rede) ao acessar rota guardada → redirect limpo a `/login`.
- Fora de escopo:
  - Mudar política de purge em erro (mantém comportamento existente: erro → purge).
  - Retry/backoff de restauração de sessão.
- files_owned:
  - `app-ng/src/app/core/auth/auth.service.ts` (+ spec)
  - `tests/e2e/conduit.e2e.test.js` (+1 suite)
  - `docs/agent/work/017-verifyauth-timeout/{PLAN,PROGRESS,EVIDENCE}.md`
  - `docs/agent/STATE.md`

## Dados, segurança e compliance
- Segurança: falha de restauração → sessão limpa (token removido) → guard → `/login`.
  Sem estado órfão; sem travamento (timeout). Sem credenciais reais (`*-e2e`/`*-006`).
- Revisão humana: required (Categoria C — toca a restauração de sessão/auth).

## Operational path & risk
- risk_category: C  # comportamento de restauração de sessão (auth) no bootstrap.
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
deterministic_gates: [build, unit_tests, negative_tests, e2e_tests, secret_scan, config_review]
human_review: required
security_reviewer: { tier: deep, effort: high }
rationale: |
  Mudança em verifyAuth (auth/sessão). O timeout evita o app preso indefinidamente e
  garante redirect limpo a /login em qualquer falha (401/rede/hang). Testes unit + E2E
  cobrem os caminhos de falha.
```

## Deterministic gates
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde (auth.service: +network +timeout).
- negative_tests: timeout NÃO trava (resolve false + purge); erro de rede → false + purge;
  E2E: erro de rede em /user → redirect /login (token limpo).
- e2e_tests: `npx playwright test` verde.
- secret_scan: nenhum segredo real.
- config_review: `timeout` no pipe; `catchError` cobre 401/rede/timeout; sem regressão.

## Condições de parada
- Se o timeout deixar a stream pendurada (não resolver), PARAR.
- Se o teste de timeout depender de zone-testing indisponível, usar vitest fake timers (feito).
