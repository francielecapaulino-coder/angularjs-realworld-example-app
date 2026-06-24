# PROGRESS — 008-angular-home-feed

State: EVALUATING

## Timeline
| Data/hora | Papel | State | Evidência |
|---|---|---|---|
| 2026-06-24 | planner | PLANNED | `docs/agent/work/008-angular-home-feed/PLAN.md` criado |
| 2026-06-24 | builder | EVALUATING | services + ArticlePreview + ArticleList + Home + rota /; build + 37 testes verdes |

## Decisões
- Categoria B: home/feed é leitura; sem nova fronteira de auth.
- ArticlesService.query → /articles[/feed] + HttpParams; TagsService.getAll → /tags.
- ArticlePreview com favoritos display-only (botão `disabled`); ação fica para slice C.
- ArticleList: ngOnChanges refetch; paginação offset=limit*(page-1), totalPages=ceil(count/limit).
- Home: estado reativo via Signals; tab default = feed (autenticado) / all (anônimo).
- Testes isolados de ArticleList chamam `ngOnChanges()` explicitamente (binding direto não dispara).

## Conformidade com PLAN / ADR-001
| Item | Estado |
|---|---|
| GET /articles vs /articles/feed | ✓ (testes) |
| Filtro de tag como query param | ✓ |
| Paginação offset/totalPages | ✓ |
| Banner anônimo; tabs feed/global/tag | ✓ |
| Sidebar de tags populares | ✓ |
| Signals | ✓ (Home/ArticleList) |
| Rota / → HomeComponent | ✓ |
| Favoritar fora de escopo | ✓ (display-only) |

## Arquivos criados/alterados (app-ng/, exceto docs)
- `src/app/core/models/article.model.ts`
- `src/app/core/articles/articles.service.ts` (+ spec)
- `src/app/core/tags/tags.service.ts` (+ spec)
- `src/app/shared/article-preview.component.ts` + html (+ spec)
- `src/app/shared/article-list.component.ts` + html (+ spec)
- `src/app/pages/home/home.component.ts` + html (+ spec)
- `src/app/app.routes.ts` — / → HomeComponent
- `src/` legado: **inalterado**

## Comandos e resultados
| Comando | Resultado |
|---|---|
| `cd app-ng && npm run build` | PASS — `build`: bundle 306.14 kB |
| `cd app-ng && CI=true npm test` | PASS — `unit_tests`/`negative_tests`: vitest 37/37 (11 arquivos) |
| `grep` segredos/Bearer em app-ng/src | PASS — `secret_scan`: nenhum |
| `grep` rota / | PASS — `config_review`: / → HomeComponent |
| `git diff --name-only HEAD -- src/` | PASS — `config_review`: src/ legado inalterado |

## Cobertura de testes nesta slice (13 novos, total 37)
- articles.service (4): /articles + paging; /articles/feed; filtro tag; omite filtros vazios.
- tags.service (1): GET /tags + unwrap.
- article-preview (2): render (título/desc/autor/tags/contagem); link p/ /article/:slug.
- article-list (3): offset/totalPages; estado empty; setPage(2) offset=limit.
- home (3): banner+Global p/ anônimo (sem Your Feed); autenticado esconde banner + default feed; tags na sidebar.

## Riscos residuais / pendências
- `apiBase` pode estar indisponível em runtime; testes usam HttpClient mockado.
- Favoritos display-only; ação na slice de artigo/favorite (C).
- Demais telas seguem placeholders.
- Requer revisão humana antes de merge.
