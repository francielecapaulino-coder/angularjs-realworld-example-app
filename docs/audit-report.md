# Relatório de Auditoria — angularjs-realworld-example-app

**Data:** 2026-06-25
**Branch auditada:** `master` (commit `c0261b6`)
**Método:** busca em código/configs/CI/docs + execução real de comandos. Só conta o que foi
encontrado no repositório ou executado; nada foi inferido.

## Contexto crítico (enquadramento)

> Este repositório é **frontend-only**: uma migração do RealWorld Conduit de **AngularJS 1.x → Angular 21** (`app-ng/`), consumindo a **API pública RealWorld** (`conduit.productionready.io`). **Não existe backend Spring Boot** neste repo — confirmado por busca (`git ls-files`): **0** arquivos `.java`, **0** `pom.xml`/`build.gradle`, **0** `Dockerfile`, **0** `docker-compose`, **0** `.py`.
>
> Em consequência, **toda a categoria INFRAESTRUTURA** (Docker, stack LGTM, métricas por endpoint, Loki, Tempo), o **mutation testing de backend (Pitest)** e o **script Python de validação** referem-se a componentes que **não existem** aqui e estão marcados ❌ Não feito. Eles provavelmente pertencem a outro repositório (o backend) que não faz parte deste workspace.

## Tabela de requisitos

| # | Requisito | Status | Evidência | Observação |
|---|-----------|:------:|-----------|------------|
| **ANGULAR / FRONTEND** ||||||
| 1 | Migração para Angular v21 | ✅ | `app-ng/package.json`: `"@angular/core": "^21.2.0"`, `"@angular/cli": "^21.2.17"`, `typescript ~5.9.2` | Versão real confirmada; app standalone em `app-ng/`. |
| 2 | Dark mode toggle funcional | ❌ | Busca em `app-ng/src`, `styles.css`, `index.html` por `dark`/`theme`/`prefers-color-scheme`/`data-theme` → **0 ocorrências** | Não há toggle nem estilos de tema. |
| 3 | Draft com localStorage no editor | ❌ | `app-ng/src/app/pages/editor/editor.component.ts` → **nenhuma** referência a `localStorage`/`draft`. O único `localStorage` no `editor.component.spec.ts` é cleanup do token de auth | Editor não persiste rascunho antes do submit. |
| 4 | Testes E2E com Playwright | ✅ | `tests/e2e/conduit.e2e.test.js`; `playwright.config.js`. Execução: **37 passed (22.8s)** | Suíte robusta (18 describes). |
| 5 | Branch com teste quebrado + branch com o mesmo passando | ✅ | Branches `failing-e2e` e `passing-e2e`. `git diff passing-e2e failing-e2e`: +9 linhas, teste `FAILING: preview shows a title that does not exist`. Topo: `4e25978 test: add intentionally failing E2E test` | Par quebrado/passando existe. |
| **PROCESSO / GOVERNANÇA** ||||||
| 6 | GitHub Issues com templates | ✅ | `.github/ISSUE_TEMPLATE/bug_report.md` e `feature_request.md`. Issues **reabilitadas** na slice 019 (`gh repo edit --enable-issues`; `hasIssuesEnabled: true`) | Resolvido na slice 019. |
| 7 | DoR e DoD documentadas | ✅ | **DoR**: `docs/process/DEFINITION-OF-READY.md` (criada na slice 019). **DoD**: `docs/process/DEFINITION-OF-DONE.md` (consolida CHARTER + OPERATING-GUIDE) | Resolvido na slice 019. |
| 8 | Issues criadas ANTES do trabalho + commits referenciando (`Closes #X`) | ❌ | `git log -60`: commits referenciam apenas **PRs** (`Merge pull request #11..#20`); **nenhum** `Closes/Fixes #<issue>`. Issues desabilitadas e inexistentes | Não há rastreabilidade issue→commit. |
| 9 | Conventional Commits no histórico | ✅ | `git log --oneline -30`: prefixos `feat:`, `fix:`, `test:`, `ci:`, `chore:`, `docs:`, `plan:` consistentes (ex.: `4aa850e fix(ci): ...`, `d6eac82 ci: ...`, `88d98d4 feat: ...`) | Padrão seguido. |
| 10 | Trabalho via CODA documentado | ✅ | `docs/process/CODA-WORKFLOW.md` (criado na slice 019) registra explicitamente o uso do CODA, papeis/estados e onde ficam os artefatos; complementa `docs/agent/` | Resolvido na slice 019. |
| **TESTES** ||||||
| 11 | Testes de integração cobrindo o contrato da API | ✅ | `tests/contract/api.contract.test.js` valida paths/envelopes/auth vs `docs/api/realworld-openapi.yaml`. Execução: **11 passed** (Test Suites: 1 passed) | Contrato consumido validado contra spec + API viva. |
| 12 | E2E cobrindo fluxos principais | ✅ | `tests/e2e/conduit.e2e.test.js`: home/feed, login, register, article, editor (+guard), settings, profile, favorite/follow, refresh-regression. **37 passed** | Cobertura ampla dos fluxos. |
| 13 | Mutation testing (Stryker front / Pitest back) com score real vs meta 95% | ❌ | `grep stryker\|pitest` em `app-ng/package.json` e `package.json` → **ausente**; nenhum `stryker.conf.*`/config Pitest; **0** arquivos | Não configurado; score não medível. Pitest, ademais, exigiria backend (inexistente). |
| **API / CONTRATO** ||||||
| 14 | Documentação OpenAPI/Swagger (arquivo ou endpoint) | ✅ | `docs/api/realworld-openapi.yaml` (**769 linhas**, `openapi: 3.0.3`). Docs de suporte em `docs/agent/work/002-realworld-openapi/` | É o contrato **consumido** (API pública), não um endpoint próprio servido por backend. Atende como arquivo OpenAPI. |
| **INFRAESTRUTURA** ||||||
| 15 | Dockerfile(s) e docker-compose funcionais (`up`/log) | ❌ | `git ls-files` → **nenhum** `Dockerfile`/`docker-compose`/`compose.y*ml`. `docker compose up` não aplicável (nada para subir) | Docker CLI existe no ambiente (v29.5.3), mas não há manifesto no repo. |
| 16 | Log de exit em `docker compose down` | ❌ | Sem compose (ver #15) | Não aplicável. |
| 17 | Stack LGTM (Loki/Grafana/Tempo/Mimir ou Prometheus) | ❌ | `git ls-files` por `loki\|grafana\|tempo\|mimir\|prometheus\|otel` → **0 arquivos** | Ausente. |
| 18 | Contador de métrica por endpoint (validar incremento real) | ❌ | Sem backend/infra de métricas (ver contexto) | Não há o que instrumentar/medir. |
| 19 | Logs de startup/exit capturados pelo Loki | ❌ | Sem Loki/compose (ver #15, #17) | Não aplicável. |
| 20 | Traces distribuídos no Tempo/Grafana | ❌ | Sem Tempo/OTel (ver #17) | Ausente. |
| **SCRIPT DE VALIDAÇÃO** ||||||
| 21 | Script Python (sobe via Docker, valida log startup, derruba, valida log exit) | ❌ | `git ls-files \| grep \.py$` → **0** arquivos Python | Não existe. Sinalizado como pendente. |
| **DOCUMENTAÇÃO** ||||||
| 22 | Prompts por etapa/slice documentados (`docs/prompts/` ou equiv.) | 🟡 | `docs/prompts/` criada na slice 019 (README + TEMPLATE + `019-governance.md`) | Estrutura criada e registro **a partir da slice 019**. Prompts das slices **002-018** ficam como **lacuna retroativa conhecida** (ver `docs/prompts/README.md`). |
| 23 | Skills usadas/necessarias documentadas | ✅ | `docs/process/SKILLS.md` (criado na slice 019) documenta as 5 skills `globant-qe-*` disponiveis e quando usar | Resolvido na slice 019. |

### Resumo quantitativo

- ✅ Feito: **11** (1, 4, 5, 6, 7, 9, 10, 11, 12, 14, 23)
- 🟡 Parcial: **1** (22 - estrutura criada; lacuna retroativa 002-018)
- ❌ Nao feito: **11** (2, 3, 8, 13, 15, 16, 17, 18, 19, 20, 21)

> Atualizacao (slice 019): itens 6, 7, 10, 23 resolvidos; 22 parcial (registro a partir de 019).

> Observação: muitos ❌ derivam da ausência de um backend/infra neste repositório (frontend-only).

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

## Pendências priorizadas

Ordem sugerida de execução (cada item = uma slice separada; correções fora desta auditoria):

**Governança rápida (baixo esforço, alto valor de processo):**
1. **Reabilitar GitHub Issues** no repo e validar os templates existentes (#6).
2. **Documentar a Definition of Ready** junto à DoD já existente (#7).
3. **Documentar prompts por slice** em `docs/prompts/` (#22) e **skills** usadas (#23).
4. **Registrar explicitamente o uso do CODA** (e vincular aos work units) (#10).
5. **Criar issues e adotar `Closes #X`** nos próximos PRs para rastreabilidade (#8) — depende de (1).

**Frontend (features pedidas e ausentes):**
6. **Dark mode toggle** com persistência (`prefers-color-scheme` + `localStorage`) (#2).
7. **Sistema de draft** no editor com `localStorage` (autosave antes do submit) (#3).

**Qualidade de testes:**
8. **Mutation testing com Stryker** no `app-ng`, medir score e comparar com a meta de 95% (#13).
   *(Pitest fica condicionado à existência de um backend.)*

**Backend + Infra (escopo grande; pressupõe um backend que não está neste repo):**
9. Decidir se o **backend Spring Boot** e a **stack de observabilidade** pertencem a este repo
   ou a outro. Se a este: criar **Dockerfile + docker-compose** (#15, #16), **stack LGTM**
   (#17), **métricas por endpoint** (#18), **logs no Loki** (#19), **traces no Tempo** (#20),
   e o **script Python de validação up/down** (#21).

**Nota de bloqueio (#8):** rastreabilidade issue→commit depende de Issues reabilitadas (#1 da lista acima).
