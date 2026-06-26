# PROGRESS - 023-backend-subtree

State: EVALUATING

## Issue
#29

## Itens entregues
- Backend Spring Boot importado em `api/` via `git subtree` (**sem --squash**, historico preservado).
  - `git subtree add --prefix=api backend main` (esqueleto inicial).
  - `git subtree pull --prefix=api backend main` apos o upstream **reconstruir o backend**.
- **Stack atual do backend (apos pull):** **Gradle**, **Java 25**, **Spring Boot 4.0.3**
  (`io.spring.dependency-management`), PostgreSQL; skeleton (Application + `contextLoads`).
- CI: job **backend** (`.github/workflows/ci.yml`) - **JDK 25** (temurin) + cache Gradle +
  service **Postgres 16** + datasource via env -> `./gradlew build --no-daemon`.
- README atualizado (secao `api/` + job backend no CI).

## Historico da slice (decisoes que mudaram durante a execucao)
- subtree **sem --squash** (decisao do usuario): historico do backend preservado.
- Tentativa inicial (esqueleto Maven, Spring Boot 4.1.0.RELEASE) **falhou no CI**: versao de
  parent **inexistente** no Maven Central -> bloqueio escalado ao usuario.
- O usuario **reconstruiu o backend no upstream** (commit `bcee568`: Gradle/Java 25/SB 4.0.3).
  Tracei via `git subtree pull`; reescrevi o job de CI de Maven/JDK21 para **Gradle/JDK25**.

## Validacao
- Java local = 11 -> build do backend NAO roda localmente; validacao ocorre no **CI** (JDK 25).
- `@SpringBootTest` + data-jpa exige datasource -> Postgres service + env `SPRING_DATASOURCE_*`.

## Gates
- config_review: YAML valido (jobs `validate` + `backend`). OK.
- backend build/test: **delegado ao CI** (JDK 25 + Gradle + Postgres). Verificar run do PR.
- frontend: job `validate` inalterado.

## Pendencias (proximas slices)
- 024: app-ng apontar para a API local (proxy/env).
- 025+: Docker/compose, observabilidade, script Python, Stryker/Pitest.
