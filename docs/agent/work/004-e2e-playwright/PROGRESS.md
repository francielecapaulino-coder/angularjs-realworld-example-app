# PROGRESS — 004-e2e-playwright

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/004-e2e-playwright/PLAN.md` criado |

## Decisões
- Categoria C: fluxo de auth JWT exercitado mesmo com mock (token em localStorage,
  header Authorization: Token enviado pelo interceptor AngularJS).
- Todos os chamados de API interceptados via `page.route()` (API inacessível).
- `@playwright/test@^1.44` requer Node >=14; testes rodam no DevContainer (Node 22).
- 8 fluxos cobertos por amostra: home, tags, login, register, abrir artigo,
  criar artigo, favoritar, seguir.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
- gulp 3 pode ter problemas com Node 22 no DevContainer.
- Seletores precisam ser validados contra DOM real do app buildado.
