# PROGRESS — 006-angular-layout-auth

State: PLANNED

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/006-angular-layout-auth/PLAN.md` criado |

## Decisões
- Categoria C: implementa interceptor de auth (`Authorization: Token <jwt>`) + serviço de sessão.
- Telas de conteúdo como placeholders; foco em shell + roteamento + auth.
- Token só é enviado para `apiBase`; 401 limpa token (sem reload forçado — difere do legado).
- Design system mantido como link remoto (vendorizar seria ponto de permissão).

## Arquivos alterados
_(a preencher pelo builder)_

## Comandos e resultados
_(a preencher pelo builder/evaluator)_

## Riscos residuais / pendências
- Aguardando aprovação humana do plano antes de implementar.
