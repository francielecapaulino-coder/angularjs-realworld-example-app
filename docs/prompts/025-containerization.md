# Slice 025 - Containerizacao (docker-compose: api/web/postgres)

- **Issue:** #33
- **Data:** 2026-06-26
- **Categoria de risco:** C (infra de build/runtime; validada localmente com Docker)

## Prompt(s) do usuario

> "aprovar" (apos confirmar que a 024 destrava a dependencia: app-ng usa `/api` configuravel)

## Decisoes tomadas

- Backend: Dockerfile multi-stage Gradle/JDK 25 -> JRE slim; `bootJar -x test` (testes no CI).
- Frontend: build node:22 -> nginx servindo o SPA + proxy `/api` -> `api:8080`.
- Compose: db(Postgres 16) + api(:8081) + web(:8080); healthchecks; sem actuator -> TCP check.
- CI de compose nao adicionado nesta slice (decisao #6 pendente); validacao real feita localmente.

## Skills necessarias

- Nenhuma skill especializada (`run_skill`) necessaria.

## Resultado

- Validado com Docker 29.5.3 / Compose v5.1.4: build OK, up healthy, web 200, /api -> 401
  (proxy correto p/ Spring Security), startup logs capturados, down -v limpo. PR: (a abrir).
