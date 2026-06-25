# PLAN - 020-dark-mode

## Status
State: PLANNED

## Issue
#23

## Objetivo
Adicionar dark mode funcional ao app-ng: toggle no header, persistencia e respeito a
preferencia do SO, sem flash perceptivel no load. (Auditoria item #2.)

## Abordagem
- `ThemeService` (`core/theme/theme.service.ts`):
  - signal `theme: 'light' | 'dark'`.
  - init: `localStorage['conduit-theme']` se existir; senao `matchMedia('(prefers-color-scheme: dark)')`.
  - `toggle()`: alterna, aplica no DOM e persiste.
  - `apply()`: `document.documentElement.setAttribute('data-theme', theme)`.
- Anti-FOUC: script inline minimo no `index.html` define `data-theme` no `<html>` antes do CSS.
  O service sincroniza o signal com o estado ja aplicado.
- `styles.css`: variaveis + overrides `:root[data-theme="dark"]` para body, navbar,
  article-preview/card, inputs/textarea, footer, links (legibilidade essencial).
- Header: botao de toggle (icone ionicon sun/moon), `aria-label` dinamico, chama `theme.toggle()`.

## Escopo
- Incluido: ThemeService + toggle no header + overrides CSS + anti-FOUC + testes.
- Fora de escopo: redesign do design system; temas alem de light/dark; configuracao por usuario no backend.

## Operational path & risk
- risk_category: B  # feature de UI aditiva, sem backend, reversivel.
- human_review: optional

## Gates
- build: `npm run build` (app-ng) verde.
- unit_tests: ThemeService (toggle/persistencia/prefers) + header (botao presente/alterna).
- e2e_tests: toggle muda `data-theme` e persiste apos `page.reload()`.
- config_review: chave `localStorage['conduit-theme']`; sem segredos.

## Condicoes de parada
- Se os overrides quebrarem legibilidade em telas-chave, reduzir escopo dos seletores.
