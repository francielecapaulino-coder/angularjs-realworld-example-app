# PROGRESS — 005-angular-scaffold

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/005-angular-scaffold/PLAN.md` criado |

## Decisões
- Angular CLI fixado em 21 (CHARTER/ROADMAP), apesar de latest npm ser 22.0.4.
- Scaffold em `app-ng/`, coexistindo com `src/` legado.
- Esta slice valida toolchain (build + smoke test); sem telas, sem auth, sem tocar `src/`.
- `app-ng/node_modules` e `app-ng/dist` fora do versionamento.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de executar o scaffold.
