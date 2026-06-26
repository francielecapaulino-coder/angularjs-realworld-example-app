# PLAN - 025-containerization

## Status
State: EVALUATING

## Issue
#33

## Objetivo
Containerizar a stack (Angular SPA + Spring Boot API + Postgres) e orquestrar com
docker-compose. (Slice 025 do plano macro full-scope.) Depende da 024 (apiBase `/api`).

## Abordagem
- `api/Dockerfile`: multi-stage Gradle/JDK 25 -> JRE slim (nao-root).
- `app-ng/Dockerfile`: build node:22 -> nginx servindo o SPA + proxy `/api` -> `api:8080`.
- `docker-compose.yml`: `db` (Postgres) + `api` + `web`, healthchecks e rede interna.

## Operational path & risk
- risk_category: C  # adiciona infra de build/runtime (Dockerfiles/compose); validado localmente.
- human_review: recommended

## Escopo
- Incluido: Dockerfiles, nginx.conf, docker-compose, .dockerignore, README, validacao real local.
- Fora de escopo: integration test automatizado (025a), metricas/observabilidade (026/027),
  job de compose no CI (decisao #6 pendente).

## Gates
- compose config / build / up / smoke (web + /api proxy) / startup logs / down: ver PROGRESS.
- frontend+backend CI (jobs existentes): inalterados, devem seguir verdes.

## Notas
- Backend sem actuator -> healthcheck TCP 8080.
- 401 em `/api/*` e o comportamento esperado (Spring Security; backend skeleton) e comprova o proxy.
