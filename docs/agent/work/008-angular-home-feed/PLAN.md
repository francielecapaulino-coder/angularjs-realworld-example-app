# PLAN — 008-angular-home-feed

## Status
State: PLANNED

## Objetivo
Substituir o placeholder da rota `/` pela home/feed real no `app-ng/`: banner
(anônimo), tabs (Your Feed / Global Feed / filtro por tag), sidebar de tags
populares, lista de artigos com paginação e previews. Leitura apenas; a ação de
favoritar e a página de artigo ficam para slices posteriores.

## Escopo
- Incluído (tudo em `app-ng/`):
  - `ArticlesService.query(config)`: GET `/articles` ou `/articles/feed` com params
    `{ tag?, author?, favorited?, limit, offset }` → `{ articles, articlesCount }`.
  - `TagsService.getAll()`: GET `/tags` → `string[]`.
  - Modelos: `Article`, `Profile` (subset consumido).
  - `ArticlePreviewComponent` (display): título, descrição, autor, data, tags,
    contagem de favoritos (botão estilizado como o legado, **sem ação** nesta slice).
  - `ArticleListComponent`: busca por `listConfig` (type/tag/page), estados de
    loading/empty, paginação (`totalPages = ceil(count/limit)`, limit=10).
  - `HomeComponent`: banner (anônimo), tabs (feed só autenticado, global, tag),
    sidebar de tags; troca de lista reativa (Signals).
  - Ligar rota `/` ao `HomeComponent` (remover placeholder da home).
  - Templates fiéis ao legado (`home-page`, `banner`, `feed-toggle`, `nav-pills`,
    `sidebar`, `tag-list`, `article-preview`, `preview-link`).
  - Testes vitest: ArticlesService.query (all/feed/tag/paginação), TagsService,
    ArticlePreview (render), ArticleList (loading/empty/paginação), Home (banner/tabs/tags).
- Fora de escopo:
  - Ação de favoritar (POST /favorite) — Categoria C, slice posterior.
  - Página de artigo, editor, profile, settings — placeholders.
  - Migração da suite E2E — slice posterior.
  - Alterações em `src/` legado, contrato, design system.
- files_owned:
  - `app-ng/src/app/core/models/*.ts`
  - `app-ng/src/app/core/articles/articles.service.ts` (+ spec)
  - `app-ng/src/app/core/tags/tags.service.ts` (+ spec)
  - `app-ng/src/app/shared/article-preview.component.ts` (+ html, spec)
  - `app-ng/src/app/shared/article-list.component.ts` (+ html, spec)
  - `app-ng/src/app/pages/home/home.component.ts` (+ html, spec)
  - `app-ng/src/app/app.routes.ts` (liga `/`)
  - `docs/agent/work/008-angular-home-feed/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md` (Signals, history, SPA).
- context_sources:
  - `src/js/home/{home.controller.js,home.html}`
  - `src/js/components/article-helpers/{article-list,article-preview}.*`
  - `src/js/services/articles.service.js` (query)
  - `src/js/services/tags.service.js` (getAll)

## Dados, segurança e compliance
- Dados: artigos/tags públicos; feed autenticado usa o token via interceptor (slice 006).
- Segurança: nenhuma nova fronteira de auth — reaproveita o interceptor existente.
  A ação de favoritar (que cruzaria auth) está fora desta slice.
- Revisão humana: required (padrão do projeto), mas risco é B (leitura).

## API
- `GET /articles?tag&author&favorited&limit&offset` → `{ articles, articlesCount }`.
- `GET /articles/feed?limit&offset` → idem (requer token; interceptor anexa).
- `GET /tags` → `{ tags: string[] }`.

## Operational path & risk
- risk_category: B  # leitura/visível ao usuário; sem nova fronteira de auth/secrets
                    # (favoritar fica fora). Feed autenticado só consome o token via interceptor.
- operational_path: standard_path_B

## Model Profile
```yaml
risk_category: B
planner:   { tier: standard, effort: high }
generator: { tier: standard, effort: high }
evaluator: { tier: standard, effort: medium }
reviewer:  { tier: standard, effort: medium }
deterministic_gates: [build, unit_tests, negative_tests, config_review]
human_review: required
budget_max_usd: 1.50
rationale: |
  Categoria B: telas de leitura (home/feed/tags) com paginação e tabs. Sem nova
  fronteira de auth (favoritar fora de escopo). Gates focam em build, testes de
  serviço/componentes e revisão de config (rotas, src/ intocado).
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde.
- negative_tests:
  - feed usa `/articles/feed`; global/tag usa `/articles` com params corretos;
  - paginação: offset = limit*(page-1); totalPages = ceil(count/limit);
  - estados loading e empty renderizam.
- config_review: rota `/` → HomeComponent; `src/` legado inalterado; sem `Bearer`.

## Condições de parada
- Se a contagem/paginação divergir do contrato (`articlesCount`), registrar e ajustar.
- Se algo exigir alterar `src/` legado, parar e reclassificar.
- Se a ação de favoritar for necessária para a home funcionar, parar — é slice C separada.

## Riscos e pendências
- `apiBase` pode estar indisponível em runtime; testes usam HttpClient mockado.
- Preview de favoritos é display-only nesta slice; ação virá na slice de artigo/favorite.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
