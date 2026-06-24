# PROGRESS — 015-auth-resolution-guarantee

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | builder | EVALUATING | refactor testável + spec de regressão + EVIDENCE.md; build + 91 unit + E2E verdes |

## Decisões
- Categoria B: refactor mínimo (função exportada `restoreSessionThenNavigate`) + teste de regressão.
- Sem tri-state explícito (o initializer já cobre a janela pendente; evitar overengineering).
- Comportamento idêntico — E2E de guard/settings/login inalterados (verdes).

## Arquivos alterados (app-ng/, exceto docs)
- `src/app/app.config.ts` — extrai `restoreSessionThenNavigate(auth, router)`; initializer a usa.
- `src/app/app.config.spec.ts` — NOVO: 2 testes de regressão (ordenação + navega mesmo anon).

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — verde |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: 91/91 (23 arquivos; +2 novos) |
| `npx playwright test -g "guard|Settings|Create article|Login"` | PASS — 9/9 (comportamento idêntico) |
| `git grep` segredos | PASS — `secret_scan`: nenhum |
| revisão de comportamento | PASS — `config_review`: refactor sem mudança observável |

## Evidências
- Ver `EVIDENCE.md` (mecanismo + resultados unit e E2E).

## Riscos residuais / pendências
- Nenhum. A garantia está travada por teste; regressão na ordenação quebra o spec/E2E.
