# PROGRESS — 014-decommission-legacy

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/014-decommission-legacy/PLAN.md` criado |

## Decisões
- Categoria C (Fase 4): remover o app AngularJS legado; app-ng vira a aplicação oficial.
- Remover `src/` (66 arquivos) + `gulpfile.js`; limpar deps/scripts legados do package.json raiz.
- Repontar `build`/`serve` para o app-ng; manter `test:contract` e `test:e2e`; adicionar `pretest:e2e`.
- Redes de segurança (contract/unit/E2E) devem permanecer verdes como gate do corte.
- Remoção é recuperável via histórico git/branch.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
- Confirmar: apagar `src/` definitivamente (recuperável via git) vs. arquivar.
