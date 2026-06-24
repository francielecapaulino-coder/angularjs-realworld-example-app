# PLAN — 009-angular-article-page

## Status
State: PLANNED

## Objetivo
Substituir o placeholder de `/article/:slug` pela página de artigo real no
`app-ng/`: carregar o artigo (GET /articles/:slug), renderizar o corpo em
**markdown sanitizado** (marked + DomSanitizer, conforme ADR-001), listar tags,
meta do autor (display) e a lista de comentários (GET). Ações de escrita
(comentar, favoritar, seguir, editar/excluir) ficam para a próxima slice.

## Escopo
- Incluído (tudo em `app-ng/`):
  - Adicionar `marked` (versão atual) como dependência do `app-ng`.
  - `ArticlesService.get(slug)`: GET `/articles/:slug` → `Article`.
  - `CommentsService.getAll(slug)`: GET `/articles/:slug/comments` → `Comment[]`.
  - Modelo `Comment`.
  - `MarkdownPipe`: `marked.parse(md)` → `DomSanitizer.sanitize(SecurityContext.HTML, html)`
    (sanitização explícita; **sem `bypassSecurityTrustHtml`**). Binding via `[innerHTML]`.
  - `ArticleComponent`: banner (título + meta do autor display), corpo sanitizado,
    tags, e lista de comentários (display); prompt de login p/ anônimos; formulário
    de comentário renderizado para autenticados **desabilitado/placeholder** (ação na próxima slice).
  - `CommentCardComponent`: exibe um comentário (autor, data, corpo).
  - Ligar rota `/article/:slug` ao `ArticleComponent` (input binding do slug).
  - Templates fiéis ao legado (`article-page`, `banner`, `article-content`, `tag-list`,
    `card comment-form`, `comment-author`).
  - Testes vitest: ArticlesService.get, CommentsService.getAll, MarkdownPipe
    (render + **sanitização XSS**), ArticleComponent (render artigo + comentários +
    estados anônimo/autenticado).
- Fora de escopo:
  - Adicionar/excluir comentários (POST/DELETE) — próxima slice (write actions, C).
  - Favoritar/seguir/editar/excluir artigo — próxima slice (C); inclui corrigir o
    bug legado de `article-actions`.
  - Editor, profile, settings — placeholders.
  - Migração da suite E2E — slice posterior.
  - Alterações em `src/` legado, contrato, design system.
- files_owned:
  - `app-ng/package.json` (+ `marked`)
  - `app-ng/src/app/core/models/comment.model.ts`
  - `app-ng/src/app/core/articles/articles.service.ts` (+ spec) — adiciona `get`
  - `app-ng/src/app/core/comments/comments.service.ts` (+ spec)
  - `app-ng/src/app/shared/markdown.pipe.ts` (+ spec)
  - `app-ng/src/app/shared/comment-card.component.ts` (+ html)
  - `app-ng/src/app/pages/article/article.component.ts` (+ html, spec)
  - `app-ng/src/app/app.routes.ts` (liga /article/:slug)
  - `docs/agent/work/009-angular-article-page/{PLAN,PROGRESS,REVIEW}.md`
  - `docs/agent/STATE.md`

## Origem e fase
- Fase (ROADMAP): 3 — Migração Angular 21
- Decisões: `docs/adr/ADR-001-...md` (markdown = marked + DomSanitizer).
- context_sources:
  - `src/js/article/{article.controller.js,article.html,comment.html}`
  - `src/js/services/comments.service.js`
  - `marked` (uso legado `{ sanitize: true }` — removido nas versões atuais → sanitizar via DomSanitizer)

## Dados, segurança e compliance
- **Risco principal (XSS):** o corpo do artigo é conteúdo não confiável (markdown de
  qualquer usuário). DEVE ser sanitizado antes de virar HTML. Estratégia:
  `DomSanitizer.sanitize(SecurityContext.HTML, marked.parse(body))` + `[innerHTML]`
  (que re-sanitiza). **Proibido** `bypassSecurityTrustHtml` no corpo do artigo.
- Comentários exibidos como texto (interpolação `{{ }}`), não como HTML.
- Revisão humana: required (Categoria C — renderização de conteúdo não confiável).

## API
- `GET /articles/:slug` → `{ article }`.
- `GET /articles/:slug/comments` → `{ comments }`.

## Operational path & risk
- risk_category: C  # renderização de conteúdo não confiável como HTML (vetor XSS).
- operational_path: strict_path_C_D

## Model Profile
```yaml
risk_category: C
planner:           { tier: deep,     effort: high }
generator:         { tier: deep,     effort: high }
evaluator:         { tier: deep,     effort: high }
reviewer:          { tier: standard, effort: medium }
security_reviewer: { tier: deep,     effort: high }
deterministic_gates: [build, unit_tests, negative_tests, secret_scan, config_review]
human_review: required
cross_family_evaluator: true
budget_max_usd: 2.50
rationale: |
  Categoria C: o corpo do artigo (markdown não confiável) é convertido em HTML e
  injetado no DOM — vetor clássico de XSS. A sanitização (DomSanitizer, sem bypass)
  é o controle de segurança; precisa de teste negativo provando que scripts/URLs
  perigosas são neutralizados, e de security_reviewer.
```

## Deterministic gates (a rodar antes de READY)
- build: `cd app-ng && npm run build` verde.
- unit_tests: `cd app-ng && CI=true npm test` verde.
- negative_tests (XSS — obrigatório):
  - MarkdownPipe remove `<script>...</script>` do output;
  - remove handlers `onerror=`/`onclick=`;
  - neutraliza `javascript:` em links/imagens;
  - código não usa `bypassSecurityTrustHtml` para o corpo do artigo (grep).
- secret_scan: nenhum segredo real.
- config_review: rota `/article/:slug` → ArticleComponent; `src/` legado inalterado.

## Condições de parada
- Se `marked` exigir config adicional que reintroduza HTML não sanitizado, parar e revisar.
- Se algum requisito empurrar `bypassSecurityTrustHtml` no corpo, PARAR (viola o controle de XSS).
- Se algo exigir alterar `src/` legado, parar e reclassificar.

## Riscos e pendências
- `marked` é nova dependência; fixar versão e revisar opções padrão (sem `mangle`/`headerIds` irrelevantes).
- Ações de escrita (comentar/favoritar/seguir) ficam para a próxima slice C.
- `apiBase` pode estar indisponível; testes usam HttpClient mockado.
- **Pendência: aprovação do plano pelo usuário antes de implementar.**
