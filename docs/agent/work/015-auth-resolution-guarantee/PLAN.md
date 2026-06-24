# PLAN — 015-auth-resolution-guarantee

## Status
State: EVALUATING

## Objetivo
Reforçar e travar por teste a garantia de que o guard de rota (`authGuard`) só é
avaliado depois que o estado de auth está **definitivamente resolvido** (autenticado
ou não), nunca em estado "pendente/desconhecido". A garantia já existe (slice 013,
APP_INITIALIZER + `withDisabledInitialNavigation`); esta slice a torna testável e
adiciona um teste de regressão + documentação de evidências.

## Escopo
- Incluído (app-ng):
  - Refactor mínimo em `app.config.ts`: extrair o callback do initializer para a função
    exportada `restoreSessionThenNavigate(auth, router)` (comportamento idêntico).
  - Novo `app.config.spec.ts`: teste de regressão que prova a ordenação
    (verifyAuth resolve ANTES de `router.initialNavigation()`) e que a navegação inicial
    ocorre mesmo com estado "não autenticado" (sem ficar pendente).
  - `docs/agent/work/015-.../EVIDENCE.md`: evidências de teste (unit + E2E).
- Fora de escopo:
  - Tri-state explícito de auth (pending/authed/anon) — desnecessário; o initializer já cobre a janela pendente.
  - Alterar `authGuard`, `AuthService.verifyAuth` ou rotas.
- files_owned:
  - `app-ng/src/app/app.config.ts` (refactor p/ testabilidade)
  - `app-ng/src/app/app.config.spec.ts` (novo)
  - `docs/agent/work/015-auth-resolution-guarantee/{PLAN,PROGRESS,EVIDENCE}.md`
  - `docs/agent/STATE.md`

## Risco
- risk_category: B  # teste + refactor mínimo sem mudança de comportamento.
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
deterministic_gates: [build, unit_tests, negative_tests, secret_scan, config_review]
human_review: optional
rationale: |
  Refactor extrai uma função pura/testável sem alterar comportamento (E2E inalterado).
  O valor está no teste de regressão que trava a garantia de ordenação auth→navegação.
```

## Deterministic gates
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde (inclui o novo spec).
- negative_tests: o spec prova que initialNavigation NÃO roda enquanto verifyAuth está pendente.
- secret_scan: nenhum segredo real.
- config_review: comportamento idêntico (E2E guard/settings verdes); só refactor + teste.

## Condições de parada
- Se o refactor alterar qualquer comportamento observável (E2E), reverter.
