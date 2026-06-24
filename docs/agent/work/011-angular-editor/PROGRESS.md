# PROGRESS — 011-angular-editor

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/011-angular-editor/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | create/update + authGuard + EditorComponent + rotas; build + 79 testes verdes |

## Decisões
- Categoria C: cria/edita conteúdo autenticado; primeiro guard de rota.
- `authGuard` funcional: anônimo → `UrlTree('/login')` (form nunca renderiza p/ anônimo).
- create=POST /articles; update=PUT /articles/:slug; payload `{ article }`; tipo `ArticleInput`.
- Reutiliza `ListErrorsComponent`/`ApiErrors` + mapeamento de erro de auth (envelope RealWorld).
- Edição carrega o artigo via GET (ngOnInit) para popular o Reactive Form.
- Tags em signal: add (Enter, sem duplicar/vazio) / remove (clique).
- Valores de teste fictícios `*-011`.

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| create POST /articles | ✓ (articles.service.spec) |
| update PUT /articles/:slug | ✓ (articles.service.spec) |
| authGuard anônimo → /login | ✓ (auth.guard.spec + config) |
| Editor novo (POST) / edição (GET+PUT) | ✓ (editor.component.spec) |
| Erros de validação renderizados | ✓ (editor.component.spec) |
| Tags add/remove | ✓ (editor.component.spec) |
| Rotas /editor[/:slug] com guard | ✓ (app.routes) |
| src/ legado inalterado | ✓ |

## Arquivos criados/alterados (app-ng/, exceto docs)
- `src/app/core/articles/articles.service.ts` (+ spec) — create/update + `ArticleInput`
- `src/app/core/auth/auth.guard.ts` (+ spec)
- `src/app/pages/editor/editor.component.ts` + html (+ spec)
- `src/app/app.routes.ts` — /editor e /editor/:slug → EditorComponent + authGuard
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 372.09 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 79/79 (20 arquivos) |
| `grep createUrlTree(['/login'])` | PASS — `negative_tests`: guard redireciona anônimo |
| `grep authGuard` nas rotas do editor | PASS — `config_review`: rotas protegidas |
| `grep` segredos/Bearer | PASS — `secret_scan`: nenhum |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (10 novos, total 79)
- articles.service (2): create POST {article}; update PUT {article}.
- auth.guard (2): anônimo → UrlTree('/login'); autenticado → true.
- editor.component (6): add tag (sem duplicar/vazio); remove tag; novo POST+nav;
  edição GET+PUT+nav; form inválido não envia (expectNone); erros de validação renderizados.

## Riscos residuais / pendências
- Guard novo: rotas públicas continuam acessíveis (não regrediram — testes/build verdes).
- `apiBase` pode estar indisponível; testes mockados.
- Atualizar o teste E2E baseline da Fase 2 ao migrar a suite E2E para URLs limpas.
- Requer revisão humana + security_reviewer antes de merge (Categoria C).
