# PROGRESS — 006-angular-layout-auth

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/006-angular-layout-auth/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | shell + interceptor + AuthService + rotas; build + 15 testes verdes |

## Decisões
- Categoria C: interceptor `Authorization: Token <jwt>` + sessão signal-based.
- Token enviado SOMENTE para `apiBase`; esquema `Token` (não `Bearer`); sem token = sem header.
- 401 limpa o token (sem `window.location.reload()` — difere do legado; evita loop).
- Telas reais como placeholders; roteamento URLs limpas (history) via `provideRouter` + `withComponentInputBinding`.
- Design system mantido como links remotos no `index.html` (Ionicons, Google Fonts, demo.productionready.io/main.css).
- Header reativo via Signals do `AuthService` (corrige o `$scope.$watch` quebrado do legado).
- Testes vitest: convertido padrão `done` (Jasmine) para Promises (vitest).

## Conformidade com ADR-001
| Decisão | Estado |
|---|---|
| Signals | `AuthService` expõe `currentUser` (signal) + `isAuthenticated` (computed) ✓ |
| history API | `provideRouter` sem `withHashLocation`; `<base href="/">` ✓ |
| SPA estático | sem SSR ✓ |
| marked + DomSanitizer | n/a nesta slice (sem markdown ainda) |
| Invariante `Token` header | interceptor usa `Token `, só p/ apiBase ✓ |
| Invariante `localStorage['jwtToken']` | `JwtService` + `APP_CONSTANTS.jwtKey='jwtToken'` ✓ |

## Arquivos criados (todos em app-ng/)
- `src/app/core/config/app.constants.ts`
- `src/app/core/auth/jwt.service.ts`
- `src/app/core/auth/token.interceptor.ts` (+ `.spec.ts`)
- `src/app/core/auth/auth.service.ts` (+ `.spec.ts`)
- `src/app/layout/header.component.ts` + `.html` (+ `.spec.ts`)
- `src/app/layout/footer.component.ts` + `.html`
- `src/app/pages/placeholder.component.ts`
- `src/app/app.routes.ts` (rotas URLs limpas)
- `src/app/app.config.ts` (HttpClient + interceptor)
- `src/app/app.ts` + `app.html` (shell) + `app.spec.ts`
- `src/index.html` (design system)
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 236.15 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 15/15 (4 arquivos) |
| `grep` segredos/Bearer em app-ng/src | PASS — `secret_scan`: nenhum; `Bearer` só em comentário negativo; token fictício `fake-jwt-token-006` |
| `grep withHashLocation/provideRouter` | PASS — `config_review`: history routing (sem hashbang) |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes (15)
- token.interceptor (5): adiciona Token para apiBase; usa Token não Bearer; sem token = sem header; não vaza token p/ origem externa; 401 limpa token.
- auth.service (6): inicia deslogado; setAuth; purgeAuth; verifyAuth sem token (sem request); verifyAuth GET /user OK; verifyAuth 401 limpa.
- header.component (2): menu deslogado (Sign in/up); menu logado (New Article/Settings/username).
- app shell (2): header+outlet+footer; sem GET /user sem token.

## Riscos residuais / pendências
- Diferença de 401 (sem reload forçado) — documentada; E2E futura valida.
- Placeholders de tela serão substituídos em slices futuras.
- `apiBase` pode estar indisponível em runtime; testes usam HttpClient mockado.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
