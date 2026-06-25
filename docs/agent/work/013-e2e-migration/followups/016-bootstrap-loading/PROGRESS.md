# PROGRESS — 016-bootstrap-loading

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | builder | EVALUATING | loader no index.html + E2E (GET /user atrasado); build + 89 unit + 27 E2E verdes |

## Decisões
- Categoria B: loader estático no shell HTML (idiomático Angular; cobre todo o pré-render).
- Sem JS extra: Angular substitui o conteúdo de `<app-root>` no render → loader some sozinho.
- Acessível (`role=status`/`aria-live`); respeita `prefers-reduced-motion`.
- Branch a partir do master (independente de #15/#16) para manter PRs focados.

## Arquivos alterados
- `app-ng/src/index.html` — loader dentro de `<app-root>` + CSS inline.
- `tests/e2e/conduit.e2e.test.js` — +1 suite "Bootstrap loading state" (GET /user atrasado).

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — loader presente no index.html buildado |
| `npx playwright test` | PASS — `e2e_tests`: 27/27 (inclui o teste de loading) |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`: 89/89 (inalterado) |
| `git grep` segredos | PASS — `secret_scan`: nenhum |
| revisão | PASS — `config_review`: loader dentro de app-root; sem mudança de lógica |

## Evidências
- Ver `EVIDENCE.md`.

## Riscos residuais / pendências
- Nenhum. Loader removido automaticamente no render (validado por E2E `toHaveCount(0)`).
