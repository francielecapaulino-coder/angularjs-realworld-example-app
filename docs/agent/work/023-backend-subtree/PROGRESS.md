# PROGRESS - 023-backend-subtree

State: EVALUATING

## Issue
#29

## Itens entregues
- Backend Spring Boot importado em `api/` via `git subtree add --prefix=api backend main`
  (**sem --squash**, historico preservado). Commit de merge: `Add 'api/' from commit fd2d821`.
- Backend: Spring Boot 4.1.0, Java 21, Maven (`mvnw`), PostgreSQL; skeleton (Application + contextLoads).
- CI: novo job **backend** (`.github/workflows/ci.yml`) - JDK 21 (temurin) + cache Maven +
  service **Postgres 16** + datasource via env -> `./mvnw -B verify`.
- README atualizado (secao do `api/` + job de backend no CI).

## Decisoes / notas
- subtree sem squash (decisao do usuario): HEAD passou de 96 -> 100 commits (inclui historico do backend).
- Java local = 11 (backend exige 21) -> build do backend **nao** roda localmente neste ambiente;
  a validacao ocorre no **CI** (setup-java 21), que e o gate desta slice.
- `@SpringBootTest contextLoads` + data-jpa exige datasource -> Postgres service no CI + env
  `SPRING_DATASOURCE_*` (sem alterar o codigo do backend).

## Gates
- config_review: YAML valido (jobs `validate` + `backend`). OK.
- backend build/test: **delegado ao CI** (JDK 21 + Postgres). Verificar run do PR.
- frontend: inalterado (build/unit/contract/e2e continuam no job `validate`).

## Pendencias (proximas slices)
- 024: app-ng apontar para a API local (proxy/env).
- 025+: Docker/compose, observabilidade, script Python, Stryker/Pitest.
