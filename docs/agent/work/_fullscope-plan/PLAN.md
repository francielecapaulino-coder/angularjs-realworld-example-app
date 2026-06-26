# PLAN macro — Fechar 100% do escopo (backend + infra + observabilidade)

Status: PROPOSTA (aguardando confirmacao do usuario antes de implementar)
Data: 2026-06-25

Este e o plano macro dividido em slices. Cada slice segue a disciplina vigente:
issue ANTES do trabalho, branch, DoR/DoD, PR com `Closes #X`, prompt em `docs/prompts/`,
skills documentadas, `docs/audit-report.md` atualizado ao final, e CI verde.

---

## 1. Abordagem para trazer o backend Spring Boot

### Opcoes
| Abordagem | Preserva historico | Atrito p/ clone/CI/compose | Vinculo c/ upstream | Veredito |
|---|---|---|---|---|
| **git subtree** | Sim (merge ou `--squash`) | Baixo (vira monorepo; sem init extra) | `git subtree pull/push` | **Recomendada** |
| git submodule | Sim (no repo original) | Alto (`--recursive`, init no CI e no docker build) | Forte (ponteiro) | Evitar p/ este caso |
| copia simples | Nao | Baixo | Nenhum | So se nao houver historico relevante |

### Recomendacao: **git subtree** em `api/`
- Motivos: o `docker-compose`, o CI e o script Python passam a operar um **monorepo coeso**
  (sem fragilidade de submodule em build/runtime); o historico do backend e preservado;
  updates do upstream continuam possiveis via `git subtree pull --prefix=api <remote> <branch>`.
- Comando de importacao (na slice de integracao, apos confirmacao):
  ```bash
  git remote add backend <URL_DO_BACKEND>
  git fetch backend
  git subtree add --prefix=api backend <BRANCH> --squash   # --squash opcional
  ```
- Diretorio proposto: **`api/`** (alternativa `backend/`).

---

## 2. Ordem sugerida das slices

> Ordenadas por dependencia, para manter cada PR pequeno e com CI verde incremental.

### Slice 023 — Integracao do backend (subtree)
- Trazer o backend Spring Boot para `api/` via `git subtree add`.
- Adicionar job de build do backend ao CI (JDK + `mvnw`/`gradlew` build + testes do backend).
- DoD: backend compila e seus testes passam no CI; historico preservado; README atualizado.
- Nao altera o app-ng ainda.

### Slice 024 — app-ng configuravel + proxy para a API local
- Tornar `apiBase` configuravel: usar caminho relativo `/api` + `proxy.conf.json` no dev
  (`ng serve` -> `http://localhost:8080`), mantendo a API publica como fallback documentado.
- Ajustar `app.constants.ts`/environments; garantir que unit/e2e continuam verdes
  (e2e segue com mocks de rede; nada depende da API publica real).
- DoD: build + unit + e2e verdes; app aponta para API local quando ela existe.

### Slice 025 — Containerizacao
- `api/Dockerfile` (build multi-stage do Spring Boot -> JRE slim).
- `app-ng/Dockerfile` (build Angular -> **nginx** servindo estatico + proxy `/api` -> backend).
- `docker-compose.yml`: `api` + `web` + **banco** (Postgres) com healthchecks e rede interna.
- DoD: `docker compose up` sobe os servicos, app fala com a API via `/api`; capturar log de startup.

### Slice 026 — Metricas (Micrometer + Prometheus)
- Instrumentar o backend: Micrometer + Actuator Prometheus; **contador por endpoint** que
  incrementa a cada chamada (ex.: `http_server_requests` + tag por rota, ou contador custom).
- Adicionar **Prometheus** ao compose, fazendo scrape do `/actuator/prometheus`.
- DoD: chamada real a um endpoint -> contador sobe no Prometheus (evidencia capturada).
- Nota: recomendamos **Prometheus** (mais simples para validacao local) no lugar de Mimir.

### Slice 027 — Logs (Loki) + Tracing (Tempo) + Grafana
- Logs estruturados do backend (JSON) -> **Loki** (via Promtail/Grafana Agent/Alloy),
  com **linha clara de startup e de shutdown**.
- Tracing distribuido via **OpenTelemetry** -> **Tempo**.
- **Grafana** com datasources (Prometheus/Loki/Tempo) provisionados.
- DoD: validacao manual documentada — log de startup/exit no Loki; trace visivel no Tempo;
  metrica no Grafana. (Pode ser dividida em 027a logs / 027b traces se ficar grande.)

### Slice 028 — Script Python de validacao
- `scripts/validate_stack.py`: `docker compose up -d` -> espera healthy -> valida log de
  **startup** -> `docker compose down` -> valida log de **exit/shutdown**.
- Exit code 0 se tudo passou; mensagem de erro clara se algo faltou.
- DoD: script executa e reporta saida; documentado em README.

### Slice 029a — Stryker (frontend): subir score
- **Issue propria.** Expandir `mutate` do Stryker alem do baseline; focar em matar
  sobreviventes de `token.interceptor.ts` (62.50%) e `theme.service.ts` (82.22%).
- Reportar o score REAL final (sem forcar 95%); documentar.
- DoD: score real documentado; CI verde.

### Slice 029b — Pitest (backend): avaliacao inicial
- **Issue propria, separada da 029a** (decisao do usuario — toolchains distintas).
- **Avaliacao inicial / exploratoria:** o backend e novo (skeleton, sem endpoints/logica
  significativa), portanto **nao ha baseline** ainda. O objetivo desta slice NAO e atingir um
  score; e **configurar o Pitest** (Gradle, plugin `info.solidsoft.pitest`), rodar e **reportar
  o que houver** (provavelmente "no mutations to apply" ou score trivial), deixando o tooling
  pronto para quando o backend ganhar logica real.
- DoD: Pitest configurado + execucao real documentada (mesmo que sem mutantes); CI verde.
- **Dependencia:** so faz sentido apos o backend ter logica de dominio; idealmente a **ultima**
  slice (ou re-executar quando endpoints existirem). Nao bloqueia as demais.

---

## 3. Estimativa

- **Nucleo: 8 slices** — 023, 024, 025, 026, 027, 028, **029a (Stryker)**, **029b (Pitest)**.
- Faixa realista: **8 a 9 slices** — 027 (observabilidade) ainda pode dividir em logs/traces.
- 029 foi **dividida em 029a (Stryker/frontend) e 029b (Pitest/backend)** — issues distintas.

---

## 4. Riscos e impactos de CI

- **CI mais pesado/lento:** adicionar build Java (JDK) e, possivelmente, `docker compose` no CI.
  Mitigacao: jobs separados (frontend vs backend vs integracao); o job de compose pode ser
  `workflow_dispatch`/agendado, ou usar o script Python como gate de integracao em job dedicado.
- **subtree:** primeira importacao pode ser volumosa; usar `--squash` se o historico for grande.
- **Banco de dados:** Postgres no compose; sem credenciais reais (somente valores de exemplo).
- **Observabilidade:** stack LGTM consome recursos; validar localmente antes de habilitar no CI.
- **Pitest:** depende de o backend ser Maven ou Gradle; pode virar slice propria.

---

## 5. Backend confirmado (inspecao do repo)

- Repo: `github.com/francielecapaulino-coder/conduit-backend-api-angularjs-realworld-example-app`
  (publico), branch padrao **`main`**.
- **Spring Boot 4.1.0**, **Java 21**, **Maven** (`mvnw`), artifact `com.conduit:conduit-backend-api`.
- Dependencias: data-jpa, security, webmvc, validation, **PostgreSQL**.
- `application.properties` define apenas `spring.application.name` -> **datasource via env**
  no compose (`SPRING_DATASOURCE_URL/USERNAME/PASSWORD`); porta default **8080**.

## 6. Decisoes — status

| # | Decisao | Status |
|---|---|---|
| 1 | URL/branch do backend | **OK** (`main`) |
| 2 | Abordagem subtree | **OK** (aprovado) |
| 3 | Diretorio `api/` | **OK** (aprovado) |
| 4 | Build tool | **OK** — agora **Gradle/Java 25/Spring Boot 4.0.3** (upstream reconstruiu na 023) |
| 5 | Metricas Prometheus vs Mimir | **Pendente** (proposta: Prometheus) |
| 6 | CI de integracao (compose no CI vs local) | **Pendente** (proposta: job dedicado/opcional) |
| 7 | Pitest junto vs separado | **OK** — **separado** em 029b (Stryker fica em 029a) |

> 5/6 afetam as slices 026/027 — nao bloqueiam 024/025. Podem ser decididos quando
> chegarmos nessas slices.

## 7. Riscos especificos do backend (a tratar na 023)

- Os testes do backend (data-jpa/security) podem exigir um **Postgres** ou **Testcontainers**
  no CI. Verificar na 023 como os testes rodam (embedded/H2/Testcontainers) e ajustar o job de
  CI (ou marcar testes de integracao como opcionais) para manter o gate verde.
