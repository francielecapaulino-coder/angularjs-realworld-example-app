# PROGRESS - 020-dark-mode

State: EVALUATING

## Issue
#23

## Itens entregues
- `ThemeService` (`app-ng/src/app/core/theme/theme.service.ts`): signal light/dark,
  init por localStorage('conduit-theme') ou prefers-color-scheme, toggle/setTheme,
  aplica `data-theme` no `<html>`.
- Botao de toggle no header (`header.component.html` + `.ts`), acessivel (aria-label/aria-pressed).
- Overrides CSS de dark mode (`app-ng/src/styles.css`) para navbar/cards/inputs/footer/banner.
- Anti-FOUC: script inline em `index.html` define `data-theme` antes do CSS; spinner respeita dark.

## Gates (evidencia)
| Gate | Resultado |
|---|---|
| build (app-ng) | OK |
| unit (Vitest) | **99 passed** (+5 ThemeService, +1 header) |
| e2e (Playwright) | **38 passed** (+1 dark mode: toggle + persiste apos reload) |
| encoding_check | 0 caracteres U+FFFD |

## Notas
- Chave de persistencia: `localStorage['conduit-theme']`.
- Escopo dos overrides: superficies essenciais para legibilidade (nao e redesign completo).
