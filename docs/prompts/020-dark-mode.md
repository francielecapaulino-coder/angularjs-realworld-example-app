# Slice 020 - Dark mode toggle

- **Issue:** #23
- **Data:** 2026-06-25
- **Categoria de risco:** B (feature de UI aditiva, sem backend)

## Prompt(s) do usuario

> "Mergear #22; iniciar slice #2 (dark mode) ou #3 (draft) conforme sua escolha"

> (Escolha confirmada) "#2 Dark mode toggle (CSS variables + botão no header +
> persistência em localStorage + prefers-color-scheme) — recomendada primeiro"

## Decisoes tomadas

- ThemeService com signal; persistencia em `localStorage['conduit-theme']`; default por `prefers-color-scheme`.
- Tema aplicado via `data-theme` no `<html>`; script anti-FOUC no index.html.
- Overrides CSS focados em legibilidade (nao redesign completo).
- Fora de escopo: temas adicionais; preferencia por usuario no backend.

## Resultado

- PR: (a abrir). Gates: build OK, unit 99 passed, e2e 38 passed, encoding limpo.
