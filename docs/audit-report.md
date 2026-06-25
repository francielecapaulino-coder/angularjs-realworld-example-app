# Relatório de Auditoria — angularjs-realworld-example-app

**Data:** 2026-06-25
**Branch auditada:** `master` (commit `c0261b6`)
**Método:** busca em código/configs/CI/docs + execução real de comandos. Só conta o que foi
encontrado no repositório ou executado; nada foi inferido.

## Contexto crítico (enquadramento)

> Este repositório é **frontend-only**: uma migração do RealWorld Conduit de **AngularJS 1.x → Angular 21** (`app-ng/`), consumindo a **API pública RealWorld** (`conduit.productionready.io`). **Não existe backend Spring Boot** neste repo — confirmado por busca (`git ls-files`): **0** arquivos `.java`, **0** `pom.xml`/`build.gradle`, **0** `Dockerfile`, **0** `docker-compose`, **0** `.py`.
>
> Em consequência, **toda a categoria INFRAESTRUTURA** (Docker, stack LGTM, métricas por endpoint, Loki, Tempo), o **mutation testing de backend (Pitest)** e o **script Python de validação** referem-se a componentes que **não existem** aqui. Por decisão de escopo, estão marcados como **Fora de escopo deste repositório** (pertencem a um projeto de backend/observabilidade separado), e não como pendência aberta. A auditoria foi **encerrada** com este recorte (ver "Status de encerramento da auditoria").

## Tabela de requisitos

| # | Requisito | Status | Evidência | Observação |
|---|-----------|:------:|-----------|------------|
| **ANGULAR / FRONTEND** ||||||
| 1 | Migração para Angular v21 | ✅ | `app-ng/package.json`: `"@angular/core": "^21.2.0"`, `"@angular/cli": "^21.2.17"`, `typescript ~5.9.2` | Versão real confirmada; app standalone em `app-ng/`. |
| 2 | Dark mode toggle funcional | ✅ | Slice 020: `app-ng/src/app/core/theme/theme.service.ts` (signal+persistencia+prefers), botao em `header.component.html`, overrides em `styles.css`, anti-FOUC em `index.html`. Testes: unit (ThemeService 5 + header 1) e e2e (toggle+reload). | Resolvido na slice 020 (Issue #23). |
| 3 | Draft com localStorage no editor | ✅ | Slice 021: `editor.component.ts` autosave em `localStorage['conduit-editor-draft']` (valueChanges debounced + effect na tagList), restore no init, clear no submit; edit mode nao usa draft. Testes: unit (4) e e2e (digita->reload->restaura->submit limpa). | Resolvido na slice 021 (Issue #25). |
| 4 | Testes E2E com Playwright | ✅ | `tests/e2e/conduit.e2e.test.js`; `playwright.config.js`. Execução: **37 passed (22.8s)** | Suíte robusta (18 describes). |
| 5 | Branch com teste quebrado + branch com o mesmo passando | ✅ | Branches `failing-e2e` e `passing-e2e`. `git diff passing-e2e failing-e2e`: +9 linhas, teste `FAILING: preview shows a title that does not exist`. Topo: `4e25978 test: add intentionally failing E2E test` | Par quebrado/passando existe. |
| **PROCESSO / GOVERNANÇA** ||||||
| 6 | GitHub Issues com templates | ✅ | `.github/ISSUE_TEMPLATE/bug_report.md` e `feature_request.md`. Issues **reabilitadas** na slice 019 (`gh repo edit --enable-issues`; `hasIssuesEnabled: true`) | Resolvido na slice 019. |
| 7 | DoR e DoD documentadas | ✅ | **DoR**: `docs/process/DEFINITION-OF-READY.md` (criada na slice 019). **DoD**: `docs/process/DEFINITION-OF-DONE.md` (consolida CHARTER + OPERATING-GUIDE) | Resolvido na slice 019. |
| 8 | Issues criadas ANTES do trabalho + commits referenciando (`Closes #X`) | 🟡 | A partir da slice 019 o fluxo passou a criar **issue antes** do trabalho e usar `Closes #X` (ex.: PRs #22/#24/#26/#28 fecham #21/#23/#25/#27). As slices **002-018** ficam como lacuna retroativa (issues estavam desabilitadas). | Frontend: **resolvido daqui em diante**. A parte de **rastreabilidade do backend** e **fora de escopo deste repositorio** (projeto de backend separado). |
| 9 | Conventional Commits no histórico | ✅ | `git log --oneline -30`: prefixos `feat:`, `fix:`, `test:`, `ci:`, `chore:`, `docs:`, `plan:` consistentes (ex.: `4aa850e fix(ci): ...`, `d6eac82 ci: ...`, `88d98d4 feat: ...`) | Padrão seguido. |
| 10 | Trabalho via CODA documentado | ✅ | `docs/process/CODA-WORKFLOW.md` (criado na slice 019) registra explicitamente o uso do CODA, papeis/estados e onde ficam os artefatos; complementa `docs/agent/` | Resolvido na slice 019. |
| **TESTES** ||||||
| 11 | Testes de integração cobrindo o contrato da API | ✅ | `tests/contract/api.contract.test.js` valida paths/envelopes/auth vs `docs/api/realworld-openapi.yaml`. Execução: **11 passed** (Test Suites: 1 passed) | Contrato consumido validado contra spec + API viva. |
| 12 | E2E cobrindo fluxos principais | ✅ | `tests/e2e/conduit.e2e.test.js`: home/feed, login, register, article, editor (+guard), settings, profile, favorite/follow, refresh-regression. **37 passed** | Cobertura ampla dos fluxos. |
| 13 | Mutation testing (Stryker front / Pitest back) com score real vs meta 95% | 🟡 | Slice 022: Stryker configurado no app-ng (`stryker.config.json`, `npm run test:mutation`). Score REAL medido (baseline core): **78.48%** (auth.guard 100%, jwt 100%, theme 82.22%, token.interceptor 62.50%). Evidencia: `docs/agent/work/022-stryker/EVIDENCE.md`. | Stryker configurado e score medido, porem **abaixo da meta 95%** e em **escopo parcial** (command runner ~5min/arquivo). Pitest (backend) permanece N/A. Expandir escopo + subir score em slices seguintes. |
| **API / CONTRATO** ||||||
| 14 | Documentação OpenAPI/Swagger (arquivo ou endpoint) | ✅ | `docs/api/realworld-openapi.yaml` (**769 linhas**, `openapi: 3.0.3`). Docs de suporte em `docs/agent/work/002-realworld-openapi/` | É o contrato **consumido** (API pública), não um endpoint próprio servido por backend. Atende como arquivo OpenAPI. |
| **INFRAESTRUTURA** ||||||
| 15 | Dockerfile(s) e docker-compose funcionais (`up`/log) | ⚪ | Nao ha backend/servico para conteinerizar neste repo (SPA estatico). | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| 16 | Log de exit em `docker compose down` | ⚪ | Sem compose (ver #15). | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| 17 | Stack LGTM (Loki/Grafana/Tempo/Mimir ou Prometheus) | ⚪ | Observabilidade pertence ao backend. | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| 18 | Contador de metrica por endpoint (validar incremento real) | ⚪ | Sem backend/endpoints proprios. | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| 19 | Logs de startup/exit capturados pelo Loki | ⚪ | Sem backend/Loki. | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| 20 | Traces distribuidos no Tempo/Grafana | ⚪ | Sem backend/OTel. | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| **SCRIPT DE VALIDAÇÃO** ||||||
| 21 | Script Python (sobe via Docker, valida log startup, derruba, valida log exit) | ⚪ | Valida um backend conteinerizado, inexistente neste repo. | Fora de escopo deste repositorio (frontend-only); pertence a um projeto de backend/observabilidade separado. |
| **DOCUMENTAÇÃO** ||||||
| 22 | Prompts por etapa/slice documentados (`docs/prompts/` ou equiv.) | 🟡 | `docs/prompts/` criada na slice 019 (README + TEMPLATE + `019-governance.md`) | Estrutura criada e registro **a partir da slice 019**. Prompts das slices **002-018** ficam como **lacuna retroativa conhecida** (ver `docs/prompts/README.md`). |
| 23 | Skills usadas/necessarias documentadas | ✅ | `docs/process/SKILLS.md` (criado na slice 019) documenta as 5 skills `globant-qe-*` disponiveis e quando usar | Resolvido na slice 019. |

### Resumo quantitativo

- ✅ Feito: **13** (1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 23)
- 🟡 Parcial: **3** (8 - rastreabilidade no frontend a partir de 019; 13 - Stryker 78.48% < 95% e escopo parcial; 22 - prompts a partir de 019)
- ⚪ Fora de escopo deste repositorio (backend/infra): **7** (15, 16, 17, 18, 19, 20, 21)
- ❌ Nao feito: **0**

> Atualizacao (slice 019): itens 6, 7, 10, 23 resolvidos; 22 parcial (registro a partir de 019).
> Atualizacao (slice 020): item 2 (dark mode) resolvido.
> Atualizacao (slice 021): item 3 (editor draft) resolvido.
> Atualizacao (slice 022): item 13 (Stryker) parcial - baseline 78.48% medido (< meta 95%, escopo parcial).

> Observacao: este repositorio e **frontend-only**. Os requisitos de **backend/infra** (15-21) e a parte de rastreabilidade de backend do #8 sao **fora de escopo deste repositorio** e pertencem a um projeto de backend/observabilidade separado. Auditoria encerrada com este recorte de escopo.

## Evidências de execução (saída real capturada)

| Comando | Resultado |
|---|---|
| `CI=true npm test --prefix app-ng` (Vitest) | **Test Files 23 passed / Tests 93 passed** |
| `npm run test:contract` (Jest+OpenAPI) | **Test Suites: 1 passed / Tests: 11 passed** |
| `npx playwright test` (E2E) | **37 passed (22.8s)** |
| `git log --oneline -30` | Conventional Commits consistentes |
| `gh issue list` | "repository has **disabled** issues" |
| `git ls-files` (java/py/docker/compose) | **0 / 0 / 0 / 0** |
| `docker --version` | Docker 29.5.3 (CLI presente; sem manifesto no repo) |

## Status de encerramento da auditoria

A auditoria foi **encerrada** com o recorte de escopo deste repositorio (frontend-only).
Resultado consolidado: **Feito 13 / Parcial 3 / Fora de escopo 7 / Nao feito 0**.

**Resolvido por slices (apos a auditoria inicial):**
- 019 (governanca): #6, #7, #10, #23 resolvidos; #22 parcial; Issues reabilitadas.
- 020: #2 (dark mode).
- 021: #3 (editor draft).
- 022: #13 (Stryker) parcial — baseline 78.48% medido (meta 95% documentada).
- #8: rastreabilidade issue->commit em pratica a partir de 019 (`Closes #X` nos PRs #22/#24/#26/#28).

**Parciais remanescentes (melhorias futuras, opcionais):**
- #13: expandir o escopo de `mutate` e matar mutantes sobreviventes rumo a 95%.
- #22: prompts das slices 002-018 (lacuna retroativa conhecida, documentada).
- #8: backfill de rastreabilidade nao sera feito retroativamente.

**Fora de escopo deste repositorio (backend/observabilidade — projeto separado):**
- #15-#21 (Docker/compose, stack LGTM, metricas por endpoint, Loki, Tempo, script Python)
  e a parte de rastreabilidade de backend do #8. Nao sao pendencias deste repo.
