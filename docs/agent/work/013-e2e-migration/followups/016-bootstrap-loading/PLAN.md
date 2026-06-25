# PLAN — 016-bootstrap-loading

## Status
State: EVALUATING

## Objetivo
Evitar a tela branca perceptível durante o bootstrap: como o `APP_INITIALIZER`
bloqueia a inicialização até o `verifyAuth()` (GET /user) resolver, exibir um
**loading state** (spinner) enquanto a rede responde, removido automaticamente
quando o app renderiza.

## Escopo
- Incluído (app-ng):
  - `index.html`: loader dentro de `<app-root>` + CSS inline (spinner centralizado,
    verde Conduit, acessível: `role="status"`/`aria-live`; respeita `prefers-reduced-motion`).
    O Angular substitui o conteúdo de `<app-root>` no primeiro render → loader some sozinho.
  - E2E: teste que atrasa `GET /user` e verifica loader visível no bootstrap → some após render.
- Fora de escopo:
  - Skeleton por página, spinners de navegação client-side (este é só o bootstrap inicial).
  - Mudanças em `app.config`/guard/AuthService.
- files_owned:
  - `app-ng/src/index.html`
  - `tests/e2e/conduit.e2e.test.js` (+1 suite)
  - `docs/agent/work/016-bootstrap-loading/{PLAN,PROGRESS,EVIDENCE}.md`
  - `docs/agent/STATE.md`

## Risco
- risk_category: B  # UX no shell HTML; sem lógica de auth/segurança.
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
deterministic_gates: [build, e2e_tests, unit_tests, secret_scan, config_review]
human_review: optional
rationale: |
  Loader estático no index.html cobre todo o pré-render (bundle + initializer + rede).
  É a abordagem idiomática Angular (Angular substitui o conteúdo de app-root no render).
  E2E com GET /user atrasado prova o comportamento.
```

## Deterministic gates
- build: `cd app-ng && npm run build` verde; loader presente no `dist/.../index.html`.
- e2e_tests: `npx playwright test` verde (inclui o teste de loading).
- unit_tests: inalterado (89/89) — mudança é só no shell HTML.
- secret_scan: nenhum segredo real.
- config_review: loader dentro de `<app-root>`; sem mudança de lógica.

## Condições de parada
- Se o loader não for removido após o render (vazamento visual), revisar/parar.
