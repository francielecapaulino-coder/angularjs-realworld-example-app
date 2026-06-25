# Slice 022 - Stryker mutation testing (baseline)

- **Issue:** #27
- **Data:** 2026-06-25
- **Categoria de risco:** B (tooling de teste aditivo)

## Prompt(s) do usuario

> "Mergear #26; iniciar slice #13 (Stryker) ou decidir sobre o escopo de backend/infra"

> (Decisao da meta) "Opção 1 — configurar Stryker, rodar e reportar o score real atual
> (sem falhar o build), com 95% documentado como meta de referência. Melhorias de score
> entram em slices seguintes"

## Decisoes tomadas

- Command runner (ng test/Vitest sem vitest.config exposto); `break: null` (build nao falha).
- Escopo baseline (4 arquivos core de auth/theme) por inviabilidade de tempo no app inteiro.
- Meta 95% documentada como referencia.

## Resultado

- Score REAL: **78.48%** no escopo (auth.guard 100%, jwt 100%, theme 82.22%, token.interceptor 62.50%).
- PR: (a abrir). Detalhes em `docs/agent/work/022-stryker/EVIDENCE.md`.
