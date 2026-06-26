# Relatorio de Auditoria (revisao 2) — angularjs-realworld-example-app

**Data:** 2026-06-25
**Branch auditada:** `master` (commit `74a77a5`)
**Metodo:** busca em codigo/configs/CI/docs (`git ls-files`, `grep`) + execucao real de
comandos (unit, contract, e2e, mutation, gh/git). So conta o que foi encontrado ou executado.

## Contexto critico (enquadramento)

> Este repositorio e **frontend-only**: migracao do RealWorld Conduit de **AngularJS 1.x ->
> Angular 21** (`app-ng/`), consumindo a **API publica RealWorld**. **Nao existe backend
> Spring Boot** aqui — reconfirmado: `git ls-files` retorna **0** arquivos `.java`/`pom.xml`/
> `build.gradle`, **0** `Dockerfile`/`docker-compose`, **0** `.py`.
>
> Por isso, os itens de **INFRAESTRUTURA (15-21)** e o **Pitest (backend)** referem-se a
> componentes inexistentes neste repo. Eles aparecem como **❌** na coluna Status (fieis ao
> checklist), com a Observacao "fora de escopo deste repositorio" — pertencem a um projeto de
> backend/observabilidade separado e estao listados a parte na secao final (nao como pendencia
> acionavel deste repo).

## Tabela de requisitos

| # | Requisito | Status | Evidencia | Observacao |
|---|-----------|:------:|-----------|------------|
| **ANGULAR / FRONTEND** ||||||
| 1 | Migracao para Angular v21 | ✅ | `app-ng/package.json`: `"@angular/core": "^21.2.0"`, `"@angular/cli": "^21.2.17"` | Versao real confirmada. |
| 2 | Dark mode toggle funcional | ✅ | `app-ng/src/app/core/theme/theme.service.ts` (signal + localStorage `conduit-theme` + `prefers-color-scheme`); botao `theme-toggle` em `header.component.html`; overrides em `styles.css`; anti-FOUC em `index.html`. E2E reconfirmado. | Slice 020 (Issue #23 / PR #24). |
| 3 | Draft com localStorage no editor | ✅ | `editor.component.ts`: `EDITOR_DRAFT_KEY = 'conduit-editor-draft'`, `saveDraft`/`restoreDraft`/clear no submit (modo novo). | Slice 021 (Issue #25 / PR #26). |
| 4 | Testes E2E com Playwright | ✅ | `tests/e2e/conduit.e2e.test.js` + `playwright.config.js`. Execucao: **39 passed (37.0s)**. | Suite ampla (19 describes). |
| 5 | Branch com teste quebrado + mesmo passando | ✅ | Branches `failing-e2e` e `passing-e2e` (locais e em `origin`). | Par quebrado/passando existe. |
| **PROCESSO / GOVERNANCA** ||||||
| 6 | GitHub Issues com templates | ✅ | `gh repo view --json hasIssuesEnabled` -> `true`; `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`. | Slice 019. |
| 7 | DoR e DoD documentadas | ✅ | `docs/process/DEFINITION-OF-READY.md` e `docs/process/DEFINITION-OF-DONE.md`. | Slice 019. |
| 8 | Issues ANTES do trabalho + commits referenciando (`Closes #X`) | 🟡 | Issues **#21/#23/#25/#27** criadas antes das slices 019-022 (todas CLOSED); commits com `Closes #X` (`d32c880`, `0c3bded`, `063cb3c`, `7f47115`). | Vale **de 019 em diante**. Slices **002-018** sem issues (lacuna retroativa, Issues estavam desabilitadas). Rastreabilidade de backend e fora de escopo deste repo. |
| 9 | Conventional Commits no historico | ✅ | `git log --oneline -30`: `feat/fix/test/ci/chore/docs/plan` consistentes (ex.: `7f47115 test:`, `4aa850e fix(ci):`, `d6eac82 ci:`). | Padrao seguido. |
| 10 | Trabalho via CODA documentado | ✅ | `docs/process/CODA-WORKFLOW.md` (papeis/estados/artefatos) + `docs/agent/work/<slice>/` (002-022). | Slice 019. |
| **TESTES** ||||||
| 11 | Testes de integracao do contrato da API | ✅ | `tests/contract/api.contract.test.js` vs `docs/api/realworld-openapi.yaml`. Execucao: **11 passed** (1 suite). | Contrato consumido validado. |
| 12 | E2E cobrindo fluxos principais | ✅ | `tests/e2e/conduit.e2e.test.js`: home/feed, login, register, article, editor (+guard), settings, profile, favorite/follow, refresh, dark mode, draft. **39 passed**. | Cobertura ampla. |
| 13 | Mutation testing (Stryker front / Pitest back) vs meta 95% | 🟡 | `app-ng/stryker.config.json` (command runner) + `npm run test:mutation`. **Rodado agora (12m45s)**: score REAL **78.48%** (auth.guard 100%, jwt 100%, theme.service 82.22%, token.interceptor 62.50%). `thresholds.high=95`. | **Abaixo de 95%** e **escopo parcial** (4 arquivos core; command runner re-roda a suite por mutante). **Pitest N/A** (sem backend). |
| **API / CONTRATO** ||||||
| 14 | Documentacao OpenAPI/Swagger | ✅ | `docs/api/realworld-openapi.yaml` (`openapi: 3.0.3`, ~20 KB). | Contrato **consumido** (arquivo), nao endpoint proprio. |
| **INFRAESTRUTURA** ||||||
| 15 | Dockerfile(s) e docker-compose funcionais (`up`/log) | ❌ | `git ls-files` -> **0** `Dockerfile`/`docker-compose`. `docker compose up` nao aplicavel (nada para subir). Docker CLI presente (v29.5.3). | **Fora de escopo deste repositorio** (frontend-only; backend separado). |
| 16 | Log de exit em `docker compose down` | ❌ | Sem compose (ver #15). | Fora de escopo deste repositorio. |
| 17 | Stack LGTM (Loki/Grafana/Tempo/Mimir ou Prometheus) | ❌ | `git ls-files` por `loki/grafana/tempo/mimir/prometheus/otel` -> **0**. | Fora de escopo deste repositorio. |
| 18 | Contador de metrica por endpoint (incremento real) | ❌ | Sem backend/endpoints proprios para instrumentar. | Fora de escopo deste repositorio. |
| 19 | Logs de startup/exit no Loki | ❌ | Sem Loki/compose. | Fora de escopo deste repositorio. |
| 20 | Traces distribuidos no Tempo/Grafana | ❌ | Sem Tempo/OTel. | Fora de escopo deste repositorio. |
| **SCRIPT DE VALIDACAO** ||||||
| 21 | Script Python (up via Docker, valida log startup, down, valida log exit) | ❌ | `git ls-files \| grep .py$` -> **0**. | Fora de escopo deste repositorio (valida backend conteinerizado, inexistente). |
| **DOCUMENTACAO** ||||||
| 22 | Prompts por etapa/slice documentados | 🟡 | `docs/prompts/`: `README.md`, `TEMPLATE.md`, `019-governance.md`, `020-dark-mode.md`, `021-editor-draft.md`, `022-stryker.md`. | Registro **a partir da slice 019**. Prompts **002-018** = lacuna retroativa conhecida (ver `docs/prompts/README.md`). |
| 23 | Skills usadas/necessarias documentadas | ✅ | `docs/process/SKILLS.md` documenta as 5 skills `globant-qe-*` e quando usar. | Slice 019. |

### Resumo quantitativo

- ✅ Feito: **13** (1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 23)
- 🟡 Parcial: **3** (8, 13, 22)
- ❌ Nao feito: **7** (15, 16, 17, 18, 19, 20, 21) — todos **fora de escopo deste repositorio** (backend/infra)

## Evidencias de execucao (saida real capturada nesta revisao)

| Comando | Resultado |
|---|---|
| `CI=true npm test --prefix app-ng` (Vitest) | **Test Files 24 passed / Tests 103 passed** |
| `npm run test:contract` (Jest+OpenAPI) | **Test Suites: 1 passed / Tests: 11 passed** |
| `npx playwright test` (E2E) | **39 passed (37.0s)** |
| `CI=true npm run test:mutation` (Stryker) | **78.48%** (killed 62 / survived 17), 12m45s |
| `gh repo view --json hasIssuesEnabled` | `true` |
| `gh issue list` | #21, #23, #25, #27 (todas CLOSED via `Closes #X`) |
| `git log --oneline -30` | Conventional Commits consistentes |
| `git ls-files` (java/py/docker/compose) | **0 / 0 / 0 / 0** |
| `gh pr list --state open` | **vazio** (nenhum PR aberto) |

## Pendencias priorizadas

Itens acionaveis **neste repositorio** (cada um = uma slice separada; correcoes fora desta auditoria):

1. **Mutation score rumo a 95% (#13):** matar mutantes sobreviventes em `token.interceptor.ts`
   (62.50%) e `theme.service.ts` (82.22%); depois **expandir o escopo de `mutate`** para os
   demais services + editor por etapas.
2. **Prompts retroativos (#22):** opcionalmente registrar (ainda que de forma resumida) os
   prompts das slices 002-018; caso contrario, manter a lacuna documentada.
3. **Rastreabilidade retroativa (#8):** o backfill issue->commit das slices 002-018 nao sera
   feito (Issues estavam desabilitadas); de 019 em diante ja esta em pratica.

## Fora de escopo deste repositorio (backend/observabilidade — projeto separado)

Nao sao pendencias acionaveis aqui; pertencem a um repositorio de backend (Spring Boot) +
observabilidade que nao faz parte deste workspace:

- **#15-#16** Dockerfile + docker-compose (`up`/`down` + logs).
- **#17** Stack LGTM (Loki/Grafana/Tempo/Mimir ou Prometheus).
- **#18** Contador de metrica por endpoint.
- **#19** Logs de startup/exit no Loki.
- **#20** Traces distribuidos no Tempo/Grafana.
- **#21** Script Python de validacao up/down.
- Parte de **backend** dos itens **#8** (rastreabilidade) e **#13** (Pitest).

## Atualizacao pos-decisao de escopo (slice 023+)

> **Mudanca de escopo (2026-06-25):** o usuario decidiu **trazer o backend Spring Boot
> para este repositorio** (monorepo) em vez de mante-lo separado. Portanto, os itens
> **#15-#21** e a parte de backend de **#8/#13** deixam de ser "fora de escopo" e passam a
> ser **pendencias planejadas**, a serem implementadas nas slices **024-029** (ver o plano
> macro em `docs/agent/work/_fullscope-plan/PLAN.md`).
>
> - **Slice 023 (esta):** backend integrado via `git subtree` em `api/` (historico preservado;
>   stack apos pull do upstream: Gradle / Java 25 / Spring Boot 4.0.3) + job de CI `backend`
>   (JDK 25 + Gradle + Postgres). Os itens de infra/observabilidade seguem
>   **❌ Nao feito** ate as slices seguintes os enderecarem.

> - **Slice 024:** app-ng agora consome a API via caminho relativo `/api`
>   (`app.constants.ts`) com dev proxy (`app-ng/proxy.conf.json` -> :8080); E2E migrado para
>   mocks em `**/api/**`. Prepara o app para falar com o backend local (containerizacao na 025).
