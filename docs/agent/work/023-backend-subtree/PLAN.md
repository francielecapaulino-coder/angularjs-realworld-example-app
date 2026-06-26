# PLAN - 023-backend-subtree

## Status
State: IMPLEMENTING

## Issue
#29

## Objetivo
Trazer o backend Spring Boot (RealWorld API) para este monorepo em `api/` via git subtree
(sem --squash) e validar seu build/testes no CI. Primeira slice do plano macro full-scope.

## Escopo
- Incluido: `git subtree add --prefix=api backend main` (historico preservado);
  job de CI `backend` (JDK 21 + Postgres) com `./mvnw -B verify`; README + docs.
- Fora de escopo: app-ng apontar para a API (024); Docker/compose (025); observabilidade (026/027).

## Operational path & risk
- risk_category: B  # integracao aditiva; reversivel; nao altera codigo de producao do app-ng.
- human_review: optional

## Gates
- config_review: YAML valido; subtree com historico preservado.
- backend build/test: CI (JDK 21 + Postgres) verde.
- frontend: job `validate` permanece verde.

## Condicoes de parada
- Se o `contextLoads` falhar no CI por config ausente do backend, ajustar o job (env/Postgres)
  SEM alterar o codigo do backend; se exigir mudanca no backend, escalar como decisao.
