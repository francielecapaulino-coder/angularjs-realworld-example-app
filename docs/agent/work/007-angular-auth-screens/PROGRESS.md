# PROGRESS — 007-angular-auth-screens

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/007-angular-auth-screens/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | attemptAuth + AuthComponent + ListErrors + rotas; build + 24 testes verdes |

## Decisões
- Categoria C: telas login/register coletam credenciais e estabelecem sessão (token).
- `AuthComponent` único alterna login/register por `data.authType` (route input binding).
- Reactive Forms; erros do RealWorld via `ListErrorsComponent` (`{ field: [msgs] }`).
- `AuthService.attemptAuth(type, credentials)`: POST `/users/login` ou `/users`; `setAuth` em sucesso.
- Valores de teste fictícios `*-007`; nenhuma credencial/token real.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| attemptAuth login → POST /users/login | ✓ (teste confirma corpo + método) |
| attemptAuth register → POST /users | ✓ (teste confirma rota distinta) |
| Erro 422 não salva token | ✓ (teste) |
| Reactive Forms + submit desabilitado durante envio | ✓ (`fieldset [disabled]="isSubmitting()"`) |
| Erros renderizados (`{ field: [msgs] }`) | ✓ (ListErrorsComponent) |
| Rotas /login e /register → AuthComponent | ✓ |
| Signals (isSubmitting, errors) | ✓ |
| Token só p/ apiBase (interceptor 006) | ✓ (inalterado) |

## Arquivos criados/alterados (todos em app-ng/, exceto docs)
- `src/app/core/auth/auth.service.ts` — `attemptAuth`, tipos `AuthCredentials`/`AuthType` (+ spec: +3 testes)
- `src/app/shared/list-errors.component.ts` (+ `.spec.ts`)
- `src/app/pages/auth/auth.component.ts` + `.html` (+ `.spec.ts`)
- `src/app/app.routes.ts` — /login e /register → AuthComponent
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 286.33 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 24/24 (6 arquivos) |
| `grep` segredos/Bearer em app-ng/src | PASS — `secret_scan`: nenhum; valores fictícios `-007` |
| `grep` rotas | PASS — `config_review`: /login e /register → AuthComponent |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (9 novos, total 24)
- auth.service.attemptAuth (3): login POST /users/login + setAuth; register POST /users; 422 não salva.
- auth.component (4): login esconde username; register mostra username; login OK navega + autentica; 422 exibe erros + não autentica + isSubmitting=false.
- list-errors (2): vazio quando null; uma linha por field/message.

## Riscos residuais / pendências
- `apiBase` pode estar indisponível em runtime; testes usam HttpClient mockado.
- Demais telas seguem placeholders; logout em slice posterior.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
