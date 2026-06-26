# Slice 023 - Backend integration via git subtree

- **Issue:** #29
- **Data:** 2026-06-25
- **Categoria de risco:** B (integracao aditiva; muda estrutura do repo, reversivel)

## Prompt(s) do usuario

> "Preciso fechar 100% do escopo original do projeto ... quero trazer esse backend Spring Boot
> para dentro deste projeto ... me proponha a melhor abordagem (subtree vs submodule vs copia)."

> "1. Backend: Maven. URL: https://github.com/francielecapaulino-coder/conduit-backend-api-angularjs-realworld-example-app"

> (Confirmacao) "Inicie a 023, mas SEM --squash (preservar todo o historico do backend)."

## Decisoes tomadas

- Abordagem: **git subtree** em `api/`, **sem --squash** (historico preservado).
- Durante a slice o backend foi reconstruido no upstream (Gradle / Java 25 / Spring Boot 4.0.3);
  tracei via `git subtree pull` e ajustei o CI.
- CI: job `backend` (JDK 25 + Gradle + Postgres service) rodando `./gradlew build`.
- Validacao do backend ocorre no CI (Java local = 11).

## Skills necessarias

- Nenhuma skill especializada (`run_skill`) foi necessaria nesta slice (integracao git + CI).

## Resultado

- Backend em `api/`; HEAD 96 -> 100 commits. PR: (a abrir). Gate: CI (job backend) verde.
