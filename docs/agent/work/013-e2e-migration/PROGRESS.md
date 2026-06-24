# PROGRESS — 013-e2e-migration

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/013-e2e-migration/PLAN.md` criado |

## Decisões
- Categoria C (Fase 4): retargetar a suite E2E para o app-ng (URLs limpas, seletores app-*).
- Reusar mocks (mesmo host) + adicionar PUT /user e DELETEs.
- Inverter o baseline do bug `article-actions` (agora renderiza autenticado).
- Adicionar coberturas: ações autenticadas no artigo, settings/logout, abas de perfil, guard do editor.
- Não tocar `src/` legado nem o código do app-ng (apenas testes/infra).
- Descomissionamento do legado fica para a próxima slice C.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
