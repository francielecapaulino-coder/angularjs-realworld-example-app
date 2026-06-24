# PROGRESS — 011-angular-editor

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/011-angular-editor/PLAN.md` criado |

## Decisões
- Categoria C: cria/edita conteúdo autenticado; primeiro guard de rota.
- `authGuard` funcional: anônimo → `/login`.
- create=POST /articles; update=PUT /articles/:slug; payload `{ article }`.
- Reutiliza `ListErrorsComponent`/`ApiErrors` e o mapeamento de erro de auth.
- Edição carrega o artigo via GET para popular o form.
- Valores de teste fictícios `*-011`.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
