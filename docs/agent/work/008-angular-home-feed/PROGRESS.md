# PROGRESS — 008-angular-home-feed

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/008-angular-home-feed/PLAN.md` criado |

## Decisões
- Categoria B: home/feed é leitura; sem nova fronteira de auth (favoritar fora de escopo).
- ArticlesService.query mapeia type→/articles[/feed] + params; TagsService.getAll→/tags.
- ArticlePreview é display-only quanto a favoritos nesta slice.
- Estado reativo via Signals; paginação limit=10.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
