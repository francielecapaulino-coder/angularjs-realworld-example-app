# PLAN — 013-e2e-migration

## Status
State: PLANNED

## Objetivo
Migrar a suite E2E (Playwright) da Fase 2 para validar o **app-ng** (Angular 21) com
URLs limpas e seletores `app-*`, substituindo a suite legada (hashbang). Reusar os
mocks de API (mesmo host), **inverter o baseline do bug `article-actions`** (agora
funciona autenticado) e cobrir os fluxos novos (ações autenticadas no artigo,
settings/logout, abas de perfil, guard do editor). Valida a paridade funcional
app-ng vs. legado antes do descomissionamento.

## Escopo
- Incluído (raiz do repo — rede de segurança, não código legado):
  - `playwright.config.js`: `webServer` passa a servir o **build do app-ng** como SPA
    (fallback de history API) na porta 4100.
  - `tests/e2e/conduit.e2e.test.js`: reescrever navegações `/#!/...` → URLs limpas
    (`/`, `/login`, `/register`, `/article/:slug`, `/editor`, `/profile/:username`, `/settings`)
    e seletores legados → `app-*` (`app-favorite-button button`, `app-follow-button button`,
    `routerLink`, `.home-page`, `.article-page`, `.article-preview`).
  - Mocks: manter `**/conduit.productionready.io/api/**` (mesmo host do app-ng);
    adicionar handlers que faltarem (PUT `/user`, DELETE `/articles/:slug`,
    DELETE `/articles/:slug/comments/:id`, DELETE favorite/follow).
  - **Inverter o baseline**: a suite "Legacy baseline — authenticated article-actions"
    passa a asserir que, autenticado, as ações **renderizam** (Follow+Favorite p/ não-autor;
    Edit/Delete p/ autor) — regressão do bug legado já corrigida no app-ng (010).
  - Novas coberturas: comentar (logado), favoritar no artigo (logado), settings (update + logout),
    abas de perfil (My/Favorited), guard do editor (anônimo → `/login`).
- Fora de escopo:
  - **Descomissionamento** do AngularJS legado (`src/`, gulp) — próxima slice C separada.
  - Alterações em `src/` legado ou no código do app-ng (apenas testes/infra de teste).
  - Contrato/OpenAPI, design system.
- files_owned:
  - `playwright.config.js`
  - `tests/e2e/conduit.e2e.test.js`
  - `docs/agent/work/013-e2e-migration/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 4 — Corte/validação E2E
- Decisões: `docs/adr/ADR-001-...md` (URLs limpas, SPA estático).
- context_sources:
  - `tests/e2e/conduit.e2e.test.js` (suite legada — mocks reaproveitáveis)
  - `playwright.config.js` (webServer atual serve `build` legado)
  - `app-ng/src/app/app.routes.ts` (rotas/guards), seletores `app-*` dos componentes
  - `app-ng` build output: `app-ng/dist/app-ng/browser` (a confirmar no build)

## Dados, segurança e compliance
- Dados: somente fictícios (`*-e2e`); mocks interceptam toda a rede — sem backend real.
- Segurança:
  - Nenhuma credencial/token real; token fictício injetado em `localStorage['jwtToken']`.
  - Validar que rotas protegidas (editor/settings) redirecionam anônimo → `/login`.
  - Validar que logout limpa o token.
- Revisão humana: required (Categoria C — altera a rede de segurança e o alvo servido).

## API (mocks já existentes + a adicionar)
- Reuso: GET tags, articles[/feed], article, comments; POST login/users/articles, favorite, follow; GET user, profiles.
- Adicionar: PUT `/user`; DELETE `/articles/:slug`, `/articles/:slug/favorite`,
  `/profiles/:username/follow`, `/articles/:slug/comments/:id`; POST `/articles/:slug/comments`.

## Operational path & risk
- risk_category: C  # altera a rede de segurança e o alvo de entrega validado (app-ng).
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
planner:           { tier: deep,     effort: high }
generator:         { tier: deep,     effort: high }
evaluator:         { tier: deep,     effort: high }
reviewer:          { tier: standard, effort: medium }
security_reviewer: { tier: deep,     effort: high }
deterministic_gates: [build, e2e_tests, negative_tests, secret_scan, config_review]
human_review: required
cross_family_evaluator: true
budget_max_usd: 3.00
rationale: |
  Categoria C: a suite E2E é a rede de segurança que autoriza o descomissionamento do
  legado. Retargetar para o app-ng e inverter o baseline do bug exige cuidado: um E2E
  frouxo pode dar falsa confiança. security_reviewer + gates + human_review.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde (confirma a pasta servida pelo Playwright).
- e2e_tests: `npm run test:e2e` (Playwright) verde contra o app-ng.
  (Se o servidor demorar/instável no ambiente, documentar o comando para execução manual.)
- negative_tests:
  - editor/settings anônimo → `/login` (guard);
  - logout limpa `localStorage['jwtToken']`;
  - artigo autenticado: ações **renderizam** (baseline invertido).
- secret_scan: nenhum token/segredo real (apenas `*-e2e`).
- config_review: `webServer` serve o app-ng (SPA fallback); `src/` legado inalterado.

## Condições de parada
- Se o build do app-ng não gerar a pasta esperada para servir, parar e ajustar o caminho.
- Se a inversão do baseline não puder ser comprovada de forma determinística, PARAR.
- Se algo exigir alterar `src/` legado ou o código do app-ng, parar e reclassificar.

## Riscos e pendências
- Caminho do build (`dist/app-ng/browser`) a confirmar; SPA precisa de fallback (`serve -s`).
- E2E pode ser lento/instável no ambiente; preferir headless e, se necessário, instruir execução manual.
- Mocks devem cobrir os novos endpoints para evitar 404 que quebrem fluxos.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
- Após esta slice: planejar o descomissionamento do AngularJS legado (`src/`, gulp) — slice C.
