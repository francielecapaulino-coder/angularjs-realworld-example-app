# PROGRESS — 013-e2e-migration

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/013-e2e-migration/PLAN.md` criado |
| 2026-06-24 | builder | (parada) | E2E inicial 22/26: rotas guardadas falharam → corrida de sessão real no app-ng |
| 2026-06-24 | builder | EVALUATING | Re-escopo aprovado: correção no app-ng (APP_INITIALIZER) + E2E migrada; build + 89 unit + 26 E2E verdes |

## Decisões
- Categoria C (Fase 4): suite E2E retargetada para o app-ng (URLs limpas, seletores app-*).
- **Re-escopo (aprovado pelo usuário):** a migração E2E revelou uma corrida real de sessão.
  A correção do app-ng entrou nesta slice (em vez de adaptar os testes), pois os E2E de
  acesso direto validam exatamente a correção.
- Correção: restauração de sessão movida para `provideAppInitializer` + `withDisabledInitialNavigation`;
  `verifyAuth()` resolve ANTES da `router.initialNavigation()`, então o `authGuard` avalia
  com a sessão já restaurada (refresh em /editor e /settings não desloga mais).
- Baseline do bug `article-actions` invertido: autenticado, as ações renderizam.
- Mocks reaproveitados (mesmo host) + PUT /user e DELETEs adicionados.
- Não tocou `src/` legado.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| webServer serve o app-ng (SPA fallback) | ✓ (playwright.config) |
| Navegações em URLs limpas + seletores app-* | ✓ (suite reescrita) |
| Baseline invertido (ações renderizam autenticado) | ✓ (Suite 7) |
| Coberturas novas (comentar, settings/logout, abas, guard) | ✓ (Suites 5/7/9/10) |
| Guard: anônimo → /login | ✓ (Suite "Editor guard") |
| src/ legado inalterado | ✓ |
| (re-escopo) corrida de sessão corrigida no app-ng | ✓ (app.config.ts) |

## Arquivos alterados
- `playwright.config.js` — webServer serve `app-ng/dist/app-ng/browser` (SPA).
- `tests/e2e/conduit.e2e.test.js` — reescrita p/ app-ng (URLs limpas, app-*, mocks +PUT/DELETE, baseline invertido, +coberturas).
- `app-ng/src/app/app.config.ts` — `provideAppInitializer` (verifyAuth) + `withDisabledInitialNavigation` + `initialNavigation()`.
- `app-ng/src/app/app.ts` — remove `verifyAuth` do ngOnInit (agora no initializer).
- `app-ng/src/app/app.spec.ts` — ajusta o teste/coment. (restauração vive no initializer).
- `src/` legado: **inalterado**.

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 376.88 kB |
| `cd app-ng && CI=true npm test` | PASS — unit 89/89 (22 arquivos) |
| `npx playwright test` | PASS — `e2e_tests`: **26/26** (inclui acesso direto a /editor e /settings) |
| guard/logout E2E | PASS — `negative_tests`: anônimo→/login; logout limpa jwtToken; baseline invertido |
| `grep` segredos | PASS — `secret_scan`: só fictícios `*-e2e` |
| webServer aponta p/ app-ng; `git diff src/` | PASS — `config_review`: SPA do app-ng; src/ inalterado |

## Cobertura E2E (26 testes, 10 suites)
- Home (4), Login (3), Register (2), Article detail (3), Create article (2),
  Editor guard anônimo (2), Favorite autenticado (2), **Article actions autenticado bug-free (2)**,
  Follow anônimo (2), Profile abas (2), Settings + logout (2).

## Efeitos colaterais positivos da correção
- "username aparece no nav após login sem reload" agora passa (sessão pronta antes da navegação).
- Refresh em rotas autenticadas (/editor, /settings) mantém o usuário logado.

## Riscos residuais / pendências
- E2E sobe `serve`; pré-requisito: `cd app-ng && npm run build` antes de `npm run test:e2e`.
- `apiBase` é interceptado nos testes; sem backend real.
- **Próxima slice (C):** descomissionamento do AngularJS legado (`src/`, gulp, configs de build legado).
- Requer revisão humana + security_reviewer antes de merge (Categoria C; re-escopo tocou app-ng).
