# PROGRESS — 005-angular-scaffold

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/005-angular-scaffold/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | `app-ng/` scaffold gerado; build + smoke test verdes |

## Decisões
- Angular CLI 21.2.17 (v21-lts), conforme CHARTER/ROADMAP (latest npm é 22; não usado).
- Scaffold em `app-ng/`, coexistindo com `src/` legado intocado.
- Gerado com: standalone, `provideRouter` (history/PathLocationStrategy = default), CSS, sem SSR.
- Test runner do scaffold Angular 21: **vitest** + jsdom (headless, sem browser).
- `app-ng/node_modules`, `dist`, `.angular/cache` ignorados pelo `.gitignore` do CLI.

## Conformidade com ADR-001
| Decisão ADR-001 | Estado no scaffold |
|---|---|
| Signals | `app.ts` usa `signal` ✓ |
| history API (PathLocationStrategy) | `provideRouter(routes)` sem `withHashLocation` = history ✓; `<base href="/">` presente ✓ |
| SPA estático (sem SSR) | gerado com `--ssr=false`; sem `@angular/ssr` ✓ |
| marked + DomSanitizer | n/a nesta slice (sem telas/markdown ainda) |

## Arquivos alterados
- `app-ng/**` (24 arquivos versionados; node_modules/dist ignorados)
- `docs/agent/work/005-angular-scaffold/PLAN.md`
- `docs/agent/work/005-angular-scaffold/PROGRESS.md`
- `docs/agent/work/005-angular-scaffold/REVIEW.md`
- `docs/agent/STATE.md`
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `npx @angular/cli@21 new app-ng --directory app-ng --routing --style=css --ssr=false --skip-git --package-manager=npm --defaults` | PASS — scaffold criado, deps instaladas |
| `cd app-ng && npm run build` | PASS — `build`: bundle 213.66 kB, dist gerado em 5.7 s |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`: vitest 2/2 verdes |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |
| `grep` segredos em app-ng/src + configs | PASS — `secret_scan`: nenhum segredo |
| `git status` app-ng/node_modules | PASS — node_modules não rastreado (.gitignore do CLI) |

## Riscos residuais / pendências
- Angular CLI exige Node >=20.19/22.12; usado Node 22 via nvm (alinhado ao DevContainer).
- Test runner é vitest (não Karma) — diferente do que o CHARTER cogitava ("Jest ou Karma");
  registrar como nota; vitest é o padrão do scaffold Angular 21 e é headless-friendly.
- Próxima slice: migração de telas/rotas + interceptor `Authorization: Token` (Categoria C).
- Suite E2E da Fase 2 (hashbang) migrará para URLs limpas quando as telas existirem.
- Requer revisão humana antes de merge.
