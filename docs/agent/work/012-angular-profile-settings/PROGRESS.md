# PROGRESS — 012-angular-profile-settings

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/012-angular-profile-settings/PLAN.md` criado |

## Decisões
- Categoria C: settings muta a sessão (PUT /user → novo token via setAuth) + logout.
- `/settings` protegido por `authGuard` (anônimo → /login).
- Profile reusa `ArticleListComponent` (abas author/favorited) e `FollowButtonComponent`.
- Settings reusa `ListErrorsComponent`/`ApiErrors`; pré-preenche de `currentUser`.
- Logout = `AuthService.purgeAuth()` + navega `/`.
- Valores de teste fictícios `*-012`.

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
