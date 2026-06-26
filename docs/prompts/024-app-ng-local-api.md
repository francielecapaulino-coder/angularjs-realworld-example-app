# Slice 024 - app-ng aponta para a API local

- **Issue:** #31
- **Data:** 2026-06-26
- **Categoria de risco:** B (config de frontend; reversivel)

## Prompt(s) do usuario

> "Esta perfeito assim (`./gradlew build`) — nao mude nada; siga para a Slice 024."
> (no contexto do plano macro: "app-ng -> API local: apiBase '/api' + proxy.conf + smoke")

## Decisoes tomadas

- `apiBase` relativo `/api`; dev proxy via `proxy.conf.json` -> http://localhost:8080.
- Prod/docker fica para a 025 (nginx). E2E permanece mockado (`**/api/**`); integracao real e 025a.

## Skills necessarias

- Nenhuma skill especializada (`run_skill`) necessaria.

## Resultado

- Gates: build OK, unit 103, e2e 39, encoding limpo. PR: (a abrir).
